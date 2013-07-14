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
		var container = $('.deck' + this.id).find('.deck-pieces');
		for (var i in this.deck) {
			container.append(piece.clone().addClass(this.deck[i].name));
		}
	}
};

// TODO:後でクラスにする...
var player_turn = 0;
var max_player = 4;

var deck_piece_templates = {
	straight:{
		type    :'path',
		body    :[[0,0]],
		inputs  :[[0,1]],
		outputs :[[0,-1]]
	},
	left_curve:{
		type    :'path',
		body    :[[0,0]],
		inputs  :[[0,1]],
		outputs :[[-1,0]]
	},
	right_curve:{
		type    :'path',
		body    :[[0,0]],
		inputs  :[[0,1]],
		outputs :[[1,0]]
	},
	left_turn:{
		type    :'path',
		body    :[[0,0],[1,0]],
		inputs  :[[1,1]],
		outputs :[[0,1]]
	},
	right_turn:{
		type    :'path',
		body    :[[0,0],[1,0]],
		inputs  :[[0,1]],
		outputs :[[1,1]]
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
var piece_names = [];
for (var key in deck_piece_templates) {
	if (key == undefined) continue;
	piece_names.push(key);
}

var deck_piece_names = [
	'straight', 'straight',
	'left_curve','left_curve','left_curve',
	'right_curve','right_curve','right_curve',
	'left_turn',
	'right_turn',
	'side_branch',
	'triple_branch',
	'block'
];

(function($){
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
				var _piece = piece.clone().removeClass('piece-template').addClass('piece');
				_piece.on('click', function(e){
					var type = piece_names[Math.floor(Math.random() * piece_names.length)];
					$(this).removeClass(function(index, css) {
						return (css.match(/\b(type\_|player)\S+/g) || []).join(' ');
					});
					$(this).addClass('type_' + type).addClass('player' + player_turn);
					player_turn = (player_turn + 1) % max_player;
				}); 
				pieces.append(_piece);
			}
		}

		for (var i in players) {
			var player = players[i];
			player.drawDeck();
		}
	});
})(jQuery);
