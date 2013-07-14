/* Player */
function Player(id) {
	this.id = id;
	this.name = '' + Math.random();
}
Player.prototype = {
	id: null,
	name: '',
	deck: [],
	enabled: false,
	setEnable: function(bool) {
		this.enabled = bool;
		this.drawDeck();
	},
	initDeck: function() {
		var container = $('.deck' + this.id);
		var pieces = container.find('.deck-pieces');
		pieces.children().remove();

		if (!this.deck) return;
		var piece = $('.deck-piece-template').clone().removeClass('deck-piece-template').addClass('deck-piece');
		for (var i in this.deck) {
			piece.clone()
				.addClass('type_' + this.deck[i].name)
				.attr('data-type', this.deck[i].name)
				// デッキのピースクリック時
				.on('click', function(){
					var target = $(this);
					target.parent().find('.deck-piece').removeClass('focus');
					if (target.hasClass('disabled')) return; 
					target.addClass('focus');
				}).appendTo(pieces);
		}
	},
	drawDeck: function() {
		var container = $('.deck' + this.id);
		container.toggleClass('disabled', !this.enabled);

		if (!this.deck) return;
		var pieces = container.find('.deck-pieces');
		container.children().each(function(){
			// TODO:
		}); 
	}
};

/* BoardPiece */
function BoardPiece() {
}
BoardPiece.prototype = {
	x:null,
	y:null,
	type: null,
	player_id: null,
	rotation: 0, //0,1,2,3
	body:[],
	input:[],
	outputs:[],
	dom: null,
	setPosition:function(x, y){
		this.x = x;
		this.y = y;
		return this;
	},
	getPosition:function(){
		return [this.x, this.y];
	},
	setType:function(type){
		this.type = type;
		return this;
	},
	setPlayerId:function(id){
		this.player_id = id;
		return this;
	},
	setRotation:function(index){
		this.rotation = index;
		return this;
	},
	setDom:function(dom){
		this.dom = dom;
		return this;
	},
	isBlank:function(){
		return (!this.type)? true: false;
	},
	hasOutput:function(dx, dy){
		var a = [dx, dy].join();
		for (var i in this.outputs) {
			if (this.outputs[i].join() === a) return true;
		}
		return false;
	},
	getConnectablePaths:function(){
		var result = [];
		var map = [[0,-1],[1,0],[0,1],[-1,0]];
		for (var i in map) {
			var target,
			    x = this.x + map[i][0],
			    y = this.y + map[i][1];
			try {
				target = belonephobia.board_pieces[x][y];
				if (target.isBlank()) continue;
				// TODO:outputを利用
			} catch(e) {
				target = undefined;
			}
		}
		return result;
	},
	setStatus:function(piece){
		this.body    = piece.body;
		this.input   = piece.input;
		this.outputs = piece.outputs;
		return this;
	},
	getInputPath:function(){
	},
	getOutputPaths:function(){
	},
	draw:function(){
		this.dom
			.removeClass(belonephobia.util.cssFilter())
			.addClass('rotate_' + this.rotation);
		if (this.type) {
			this.dom
				.addClass('type_' + this.type)
				.addClass('player_' + this.player_id);
		}
	}
};

/* PieceSet */
function PieceSet() {
}
PieceSet.prototype = {
	type: null,
	player_id: null,
	rotation: 0, //0,1,2,3
	template: null,
	setType:function(type){
		this.type = type;
		this.template = belonephobia.deck_piece_templates[this.type];
		return this;
	},
	setPlayerId:function(id){
		this.player_id = id;
		return this;
	},
	setRotation:function(index){
		this.rotation = index;
		return this;
	},
	trialToBoard:function(x, y, force_connect){
		var pieces = this.getPieces();
		var target_piece;
		var piece;
		for (var i in pieces) {
			piece = pieces[i];
			try {
				target_piece = belonephobia.board_pieces[+x + piece.x][+y + piece.y];
				if (!target_piece.isBlank()) return false;
			} catch (e) {
				console.log('trial fail', piece, x, y);
				return false;
			}
		}
		// 繋げられることを強制する
		if (force_connect) {
			try {
				var input = this.template.input;
				input = this.calcRotation(input[0], input[1], this.rotation);
				target_piece = belonephobia.board_pieces[+x + input[0]][+y + input[1]];
				if (target_piece.isBlank()) return false;
				if (!target_piece.hasOutput(-input[0], -input[1])) return false;
			} catch (e) {
				console.log('trial fail', piece, x, y);
				return false;
			}
		}
		return true;
	},
	setToBoard:function(x, y, force_connect){
		if (!this.trialToBoard(x, y, force_connect)) {
			return this;
		};

		var pieces = this.getPieces();
		for (var i in pieces) {
			var piece = pieces[i];
			var target_piece = belonephobia.board_pieces[+x + piece.x][+y + piece.y];
			target_piece
				.setType(this.type)
				.setPlayerId(this.player_id)
				.setRotation(this.rotation)
				.setStatus(piece)
				.draw();
		}
		return true;
	},
	getPieces:function(){
		// TODO:横長ピースにも対応させる
		var retval = [];
		var template = this.template;
		for (var i in template.body) {
			var x = template.body[i][0];
			var y = template.body[i][1];

			var self_pos    = this.calcRotation(x, y, this.rotation);
			
			var input;
			if (template.input) {
				input = this.calcRotation(template.input[0], template.input[1], this.rotation);
			}

			var outputs = [];
			for (var j in template.outputs) {
				outputs.push(this.calcRotation(template.outputs[j][0], template.outputs[j][1], this.rotation));
			}
			retval.push({
				x:self_pos[0],
				y:self_pos[1],
				body:[[0,0]],
				input:input,
				outputs:outputs
			});
		}
		return retval;
	},
	calcRotation:function(x, y, rotation){
		switch (rotation) {
		case 1:
			return [-y, x];
		case 2:
			return [-x, -y];
		case 3:
			return [y, -x];
		case 0:
		default:
			return [x, y];
		}
	}
}

/* Belonephobia (main)*/
function Belonephobia() {
	// ユニークなtype一覧を取得
	this.piece_names = [];
	for (var key in this.deck_piece_templates) {
		if (key == undefined) continue;
		this.piece_names.push(key);
	}
}
Belonephobia.prototype = {
	piece_names: [],
	deck_piece_templates: {
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
		this.player_turn = 0;
		this.max_player = 4;
		this.players = [];

		this.initPlayers();
		this.initBoardPieces();
	},
	initPlayers: function() {
		// 各プレイヤーに配るデッキを作成	
		var deck = [];
		for (var i in this.deck_piece_names) {
			var name = this.deck_piece_names[i];
			if (!this.deck_piece_templates[name]) {
				continue;
			}
			// TODO:nameというよりtype
			// TODO:ここでnameセットするの微妙
			this.deck_piece_templates[name].name = name;
			deck.push(this.deck_piece_templates[name]);
		}
		
		// 各プレイヤーを作成
		// TODO:プレイヤーIDとdeckIDをどう結びつけるか
		this.players = [
			new Player(0),
			new Player(1),
			new Player(2),
			new Player(3)
		];
		for (var i in this.players) {
			var player = this.players[i];
			// デッキを配る
			player.deck = $.merge([], deck);
		}
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
		// TODO:これから設置しようとしてるピースを考慮する？
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

(function($){
	$(document).ready(function() {
		belonephobia = new Belonephobia();

		var base_pieces = $('.game-container .board .base-pieces');
		var pieces = $('.game-container .board .pieces');
		var piece = $('.piece-template');

		for (var y=0; y<belonephobia.board_rows; y++) {
			for (var x=0; x<belonephobia.board_columns; x++) {
				base_pieces.append(
					piece.clone()
					.removeClass('piece-template')
					.addClass('piece')
					.attr('id', 'piece_' + x + '_' + y)
				);
				var _piece = piece.clone().removeClass('piece-template').addClass('piece');
				_piece
					.attr('id', 'piece_' + x + '_' + y)
					.on('click', function(e){
						// ボード側のピースクリック時
						// デッキ側の状態を調べる
						// TODO:DOM要素じゃなくデッキの状態もデータで持っておくべきかも
						var focus_piece = $('div.deck' + belonephobia.player_turn).find('div.deck-piece.focus');
						if (focus_piece.length != 1) return;

						// ボード側の状態を調べる
						var board_piece_dom = $(this);
						var position = board_piece_dom.attr('id').split('_');
						var x = position[1], y = position[2];
						var board_piece = belonephobia.board_pieces[x][y];
						if (!board_piece) {
							console.log('unknown board_piece');
							return;
						}
						if (!board_piece.isBlank()) {
							console.log('board_piece not blank');
							return;
						}
						
						var type = focus_piece.data('type');

						// 設置できるか調べる
						for (var i in [0,1,2,3]) {
							var piece_set = new PieceSet()
								.setType(type)
								.setPlayerId(belonephobia.player_turn)
								.setRotation(+i);
							if (!piece_set.trialToBoard(x, y, true)) {
								console.log('cannot set');
								continue;
							}
							// ボード側を更新する
							piece_set.setToBoard(x, y, true);

							// デッキ側を更新する
							focus_piece.removeClass('focus').addClass('disabled');

							belonephobia.drawNextPoints();
							belonephobia.nextTurn();
							break;
						};
					}); 
				pieces.append(_piece);
			}
		}

		belonephobia.init();
		for (var i in belonephobia.players) {
			var player = belonephobia.players[i];
			player.initDeck();
		}

		// 本来ならプレイヤの順番を決めてから
		belonephobia.players[belonephobia.player_turn].setEnable(true);

		belonephobia.drawNextPoints();
		belonephobia.drawBoardPieces();
	});
})(jQuery);
