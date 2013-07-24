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
	initDeck: function(deck) {
		this.deck = deck;

		// TODO:お掃除
		var container = $('.deck' + this.id);

		var deck_dom = $('.deck-template').clone().attr('class', 'deck');
		container.append(deck_dom);

		deck_dom.find('.button').on('click', function(){
			belonephobia.deployPiece();
		});

		var pieces = container.find('.deck-pieces');
		pieces.children().remove();

		var piece = $('<div>').addClass('deck-piece');
		for (var i in this.deck) (function(deck_piece, i){
			piece
				.clone()
				.addClass('type_' + deck_piece.name)
				.attr('data-type', deck_piece.name)
				// デッキのピースクリック時
				.on('click', function(){
					var target = $(this);
					target.parent().find('.deck-piece').removeClass('focus');
					if (target.hasClass('disabled')) return; 
					target.addClass('focus');

					// TODO:自分の番であるプレイヤーが操作した時にだけresetDraftさせたい
					// belonephobia.resetDraft();
				}).appendTo(pieces);
		})(this.deck[i], i);
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

