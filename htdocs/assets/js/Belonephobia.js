/* Belonephobia (main)*/
function Belonephobia() {
	this.piece_template_manager = new PieceTemplateManager;
}
Belonephobia.prototype = {
	piece_template_manager:null,
	deck_piece_names: [
		'straight', 'straight',
		'left_curve','left_curve','left_curve',
		'right_curve','right_curve','right_curve',
		'left_turn',
		'right_turn',
		'side_branch',
		'triple_branch',
		'block'
	],
	util: {
		cssFilter: function(prefix_pattern){
			prefix_pattern = prefix_pattern || 'type|player|rotate';
			return function(index, css) {
				return (css.match(new RegExp("\\b(" + prefix_pattern + ")\\_\\S+", "g")) || []).join(' ');
			}
		}
	},

	board_pieces: [],
	// playerが順番に並んだ配列を用意しておいて添え字player_turnで参照する必要あるかも
	player_turn: 0,
	max_player: 4,
	board_columns:10,
	board_rows:10,
	players: [],
	init: function() {
		this.initPlayers();
		this.initBoardPieces();

		// 本来ならプレイヤの順番を決めてから
		this.players[this.player_turn].setEnable(true);

		this.drawNextPoints();
		this.drawBoardPieces();
	},
	reset: function() {
		// TODO:initとは差別化した、再プレイ時に呼ばれるメソッドを追加する	
		this.player_turn = 0;
		this.initPlayers();
	},
	initPlayers: function() {
		this.players = [];

		// 各プレイヤーに配るデッキを作成
		var deck = [];
		for (var i in this.deck_piece_names) {
			var name = this.deck_piece_names[i];
			if (!this.piece_template_manager.getTemplate(name)) {
				continue;
			}
			// TODO:nameというよりtype
			// TODO:ここでnameセットするの微妙
			this.piece_template_manager.getTemplate(name).name = name;
			deck.push(this.piece_template_manager.getTemplate(name));
		}
		
		// 各プレイヤーを作成
		// TODO:プレイヤーIDとdeckIDをどう結びつけるか
		this.players = [
			new Player(0),
			new Player(1),
			new Player(2),
			new Player(3)
		];
		for (var i in this.players) (function (player){
			// デッキを配る
			player.initDeck($.merge([], deck));
		})(this.players[i]);
	},
	initBoardPieces: function() {
		var pieces_dom = $('.game-container .board .pieces');

		this.board_pieces = [];
		for (var x=0; x< this.board_columns; x++) {
			var pieces = [];
			for (var y=0; y< this.board_rows; y++) {
				pieces[y] = new BoardPiece().setPosition(x, y).setDom(pieces_dom.find('#piece_' + x + '_' + y));
			}
			this.board_pieces.push(pieces);
		}
		new PieceSet().setType('straight').setPlayerId(0).setRotation(0).setToBoard(4, 4);
		new PieceSet().setType('straight').setPlayerId(1).setRotation(1).setToBoard(5, 4);
		new PieceSet().setType('straight').setPlayerId(2).setRotation(2).setToBoard(5, 5);
		new PieceSet().setType('straight').setPlayerId(3).setRotation(3).setToBoard(4, 5);
	},
	nextTurn: function() {
		this.players[this.player_turn].setEnable(false);
		this.player_turn = (this.player_turn + 1) % this.max_player;
		this.players[this.player_turn].setEnable(true);
	},
	// pathを設置できる場所(先端の次に来る空白)を強調表示する
	drawNextPoints: function(focus_piece_type){
		// TODO:focus中のピース(focus_piece_type)を考慮する？
		$('.base-pieces').find('.highlight').removeClass('highlight');
		for (var x in this.board_pieces) {
			var pieces = this.board_pieces[x];
			for (var y in pieces) {
				var piece = pieces[y];
				if (piece.isBlank()) continue;
				var outputs = piece.outputs;
				if (!outputs) continue;
				
				// 向いてる先のピースを調べる
				for (var i in outputs) {
					var position = outputs[i];
					try {
						var target_piece = this.board_pieces[+x + position[0]][+y + position[1]];
						if (!target_piece.isBlank()) continue;
						var base_piece = $('.base-pieces').find('#piece_' + target_piece.getPosition().join('_'));
						base_piece.toggleClass('highlight', true);
					} catch (e) {
					}
				}
			}
		}
	},
	// ダメージを計算する
	getDamages: function(){
		var map = {"0,1":0, "-1,0":1, "0,-1":2, "1,0":3};
		var player_damages = [0, 0, 0, 0];
		for (var x in this.board_pieces) {
			var pieces = this.board_pieces[x];
			for (var y in pieces) {
				var piece = pieces[y];
				if (piece.isBlank()) continue;
				var outputs = piece.outputs;
				if (!outputs) continue;
				
				// 向いてる先のピースを調べる
				for (var i in outputs) {
					var position = outputs[i];
					try {
						var target_piece = this.board_pieces[+x + position[0]][+y + position[1]];
						if (target_piece.isBlank()) continue;
						if (!target_piece.input) {
							player_damages[map[position.join(',')]]++;
							continue;
						}
						// TODO:calcSub()をutilなどに置く
						if (target_piece.input[0] + position[0] == 0 && target_piece.input[1] + position[1] == 0) {
							// 先がつながっている
							continue;
						}
						player_damages[map[position.join(',')]]++;
					} catch (e) {
						player_damages[map[position.join(',')]]++;
					}
				}
			}
		}
		// undefinedなどを除外する
		player_damages = [player_damages[0], player_damages[1], player_damages[2], player_damages[3]];
		console.log(player_damages);
		return player_damages;
	},
	drawDamages: function(player_damages){
		for (var i = 0; i < 4; i++) {
			var player_id = i;
			var damage = player_damages[i];
			var damages = $('div.deck' + i).find('div.deck-damages');
			damages.children().remove();
			for (var d = 0; d < damage; d++) {
				damages.append($('<div>').addClass('damage'));
			}
		}
		return player_damages;
	},
	drawBoardPieces: function() {
		for (var x in this.board_pieces) {
			var pieces = this.board_pieces[x];
			for (var y in pieces) {
				var piece = pieces[y];
				piece.draw();
			}
		}
	}
};

