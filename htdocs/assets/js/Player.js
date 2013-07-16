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

