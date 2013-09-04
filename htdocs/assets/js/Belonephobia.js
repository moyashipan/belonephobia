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
		'triple_branch'
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
	turn: 1,
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
		this.turn = 1;
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
	// ボード側のピースクリック時
	onBoardPieceClick: function(e) {
		// デッキ側の状態を調べる
		// TODO:DOM要素じゃなくデッキの状態もデータで持っておくべきかも
		var focus_piece = $('div.deck' + belonephobia.player_turn).find('div.deck-piece.focus'),
		    focus_type = focus_piece.data('type');
		if (focus_piece.length != 1) return;

		// ボード側の状態を調べる
		var dom = $(this), x = +dom.data('x'), y = +dom.data('y'),
		    board_piece = belonephobia.board_pieces[x][y];
		if (!board_piece) return;
		if (!board_piece.isBlank()) return;

		// 設置できるか調べる
		var enable_sets = [], piece_set;
		for (var i in [0,1,2,3]) {
			// すでにdraftが設置されていればその角度から調べる
			var r = 1 + (+i + board_piece.rotation) % 4;
			piece_set = new PieceSet()
				.setDraft(true)
				.setType(focus_type)
				.setPlayerId(belonephobia.player_turn)
				.setRotation(r);

			// ボード側を更新する
			if (!piece_set.trialToBoard(x, y, true)) continue;
			enable_sets.push(piece_set);
		};
		if (!enable_sets.length) return;

		// draft状態をリセットする
		belonephobia.resetDraft();

		piece_set = enable_sets[0];
		piece_set.setToBoard(x, y, true);
	},
	hasDamage: function(is_trial) {
		var damages = belonephobia.getDamages(is_trial);
		var has_damage = (damages.join('') != '0000');
		return has_damage;
	},
	// draft状態を確定状態へ
	deployPiece: function() {
		if (belonephobia.turn === 1 && belonephobia.hasDamage(true)) {
			alert('1ターン目はダメージを与える手は打てません');
			return;
		}

		// draft状態を確定する
		var has_draft = false;
		belonephobia.eachBoardPiece(function(piece){
			if (piece.is_draft) {
				piece.setDraft(false).draw();
				has_draft = true;
			}
		});
		if (!has_draft) return;

		// デッキ側を更新する
		var focus_piece = $('div.deck' + belonephobia.player_turn).find('div.deck-piece.focus');
		focus_piece.removeClass('focus').addClass('disabled');

		var damages = belonephobia.getDamages();
		belonephobia.drawDamages(damages);
		belonephobia.drawNextPoints();
		belonephobia.nextTurn();
	},
	resetDraft: function() {
		belonephobia.eachBoardPiece(function(piece){
			if (piece.is_draft) piece.reset().draw();
		});
	},
	nextTurn: function() {
		this.players[this.player_turn].setEnable(false);
		this.player_turn = (this.player_turn + 1) % this.max_player;
		this.players[this.player_turn].setEnable(true);
		this.turn += +(this.player_turn === 0);
	},
	// board_piecesをイテレートさせるヘルパーメソッド
	eachBoardPiece: function(callback) {
		for (var x in this.board_pieces) {
			var pieces = this.board_pieces[x];
			for (var y in pieces) {
				var piece = pieces[y];
				callback.call(this, piece);
			}
		}
	},
	// pathを設置できる場所(先端の次に来る空白)を強調表示する
	drawNextPoints: function(focus_piece_type){
		// TODO:focus中のピース(focus_piece_type)を考慮する？
		$('.base-pieces').find('.highlight').removeClass('highlight');
		this.eachBoardPiece(function(piece){
			if (piece.isBlank()) return;
			
			// 向いてる先のピースを調べる
			piece.eachOutputPiece(function(dx, dy, piece){
				if (!piece.isBlank()) return;
				var base_piece = $('.base-pieces').find('#piece_' + piece.getPosition().join('_'));
				base_piece.toggleClass('highlight', true);
			});
		});
	},
	// ダメージを計算する
	getDamages: function(is_trial){
		var map = {"0,1":0, "-1,0":1, "0,-1":2, "1,0":3};
		var player_damages = [0, 0, 0, 0];
		this.eachBoardPiece(function(piece){
			if (piece.isBlank(is_trial)) return;

			// 向いてる先のピースを調べる
			piece.eachOutputPiece(function(dx, dy, piece){
				if (piece.isBlank(is_trial)) return;
				if (!piece.input) {
					player_damages[map[[dx, dy].join(',')]]++;
					return;
				}
				// TODO:calcSub()をutilなどに置く
				if (piece.input[0] + dx == 0 && piece.input[1] + dy == 0) {
					// 先がつながっている
					return;
				}
				player_damages[map[[dx, dy].join(',')]]++;
			}, function(dx, dy){
				player_damages[map[[dx, dy].join(',')]]++;
			});
		});
		// undefinedなどを除外する
		player_damages = [player_damages[0], player_damages[1], player_damages[2], player_damages[3]];
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
		this.eachBoardPiece(function(piece){
			piece.draw();
		});
	}
};

