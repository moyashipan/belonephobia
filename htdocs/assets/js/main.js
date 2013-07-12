function Player(id) {
	this.id = id;
	this.name = '' + Math.random();
}
Player.prototype = {
	id: null,
	name: '',
	deck: [],
	drawDeck: function() {
		if (!this.deck) return;
		var piece = $('.deck-piece-template').clone().removeClass('deck-piece-template').addClass('deck-piece');
		var container = $('.deck' + this.id);
		for (var i in this.deck) {
			container.append(piece.clone().addClass(this.deck[i].name));
		}
	}
};

(function($){
	var deck_piece_templates = {
		straight:{
			type    :'path',
			body    :[[0,0]],
			inputs  :[[0,1]],
			outputs :[[0,-1]]
		},
		right_curve:{
			type    :'path',
			body    :[[0,0]],
			inputs  :[[0,1]],
			outputs :[[1,0]]
		},
		left_curve:{
			type    :'path',
			body    :[[0,0]],
			inputs  :[[0,1]],
			outputs :[[-1,0]]
		},
		right_turn:{
			type    :'path',
			body    :[[0,0],[1,0]],
			inputs  :[[0,1]],
			outputs :[[1,1]]
		},
		left_turn:{
			type    :'path',
			body    :[[0,0],[1,0]],
			inputs  :[[1,1]],
			outputs :[[0,1]]
		},
		side_branch:{
			type    :'path',
			body    :[[0,0]],
			inputs  :[[0,1]],
			outputs :[[1,0],[-1,0]]
		},
		triple_branch:{
			type    :'path',
			body    :[[0,0]],
			inputs  :[[0,1]],
			outputs :[[1,0],[-1,0],[0,-1]]
		},
		block:{
			type    :'block',
			body    :[[0,0]],
			inputs  :[],
			outputs :[]
		}
	};
	var deck_piece_names = [
		'straight', 'straight',
		'right_curve','right_curve','right_curve',
		'left_curve','left_curve','left_curve',
		'right_turn',
		'left_turn',
		'side_branch',
		'triple_branch',
		'block'
	];
	
	// 各プレイヤーに配るデッキを作成	
	var deck = [];
	for (var i in deck_piece_names) {
		var name = deck_piece_names[i];
		if (!deck_piece_templates[name]) {
			continue;
		}
		// TODO:ここでnameセットするの微妙
		deck_piece_templates[name].name = name;
		deck.push(deck_piece_templates[name]);
	}
	
	// 各プレイヤーを作成
	// TODO:プレイヤーIDとdeckIDをどう結びつけるか
	var players = [
		new Player(0),
		new Player(1),
		new Player(2),
		new Player(3)
	];
	for (var i in players) {
		var player = players[i];
		// デッキを配る
		player.deck = $.merge([], deck);
	}
	
	$(document).ready(function() {
		var base_pieces = $('.game-container .board .base-pieces');
		var pieces = $('.game-container .board .pieces');
		var piece = $('.piece-template');

		for (var y=0; y<10; y++) {
			for (var x=0; x<10; x++) {
				base_pieces.append(piece.clone().removeClass('piece-template').addClass('piece'));
				pieces.append(piece.clone().removeClass('piece-template').addClass('piece'));
			}
		}

		for (var i in players) {
			var player = players[i];
			player.drawDeck();
		}
	});
})(jQuery);
