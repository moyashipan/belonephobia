/* Belonephobia (main)*/
function Belonephobia() {
	// ユニークなtype一覧を取得
	this.piece_names = [];
	for (var key in this.piece_templates) {
		if (key == undefined) continue;
		this.piece_names.push(key);
	}
}
Belonephobia.prototype = {
	piece_names: [],
	piece_templates: {
		straight:{
			body    :[[0,0]],
			input   :[0,1],
			outputs :[[0,-1]]
		},
		left_curve:{
			body    :[[0,0]],
			input   :[0,1],
			outputs :[[-1,0]]
		},
		right_curve:{
			body    :[[0,0]],
			input   :[0,1],
			outputs :[[1,0]]
		},
		left_turn:{
			body    :[[0,0],[-1,0]],
			input   :[0,1],
			outputs :[[-1,1]]
		},
		right_turn:{
			body    :[[0,0],[1,0]],
			input   :[0,1],
			outputs :[[1,1]]
		},
		side_branch:{
			body    :[[0,0]],
			input   :[0,1],
			outputs :[[1,0],[-1,0]]
		},
		triple_branch:{
			body    :[[0,0]],
			input   :[0,1],
			outputs :[[1,0],[-1,0],[0,-1]]
		},
		block:{
			body    :[[0,0]],
			input   :null,
			outputs :null
		}
	},
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
			if (!this.piece_templates[name]) {
				continue;
			}
			// TODO:nameというよりtype
			// TODO:ここでnameセットするの微妙
			this.piece_templates[name].name = name;
			deck.push(this.piece_templates[name]);
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

