(function($){
	$(document).ready(function() {
		window.scrollTo(0,1);
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
					.attr('data-x', x)
					.attr('data-y', y)
					.on('click', belonephobia.onBoardPieceClick); 
				pieces.append(_piece);
			}
		}

		belonephobia.init();

		document.addEventListener('gestureend', function(e) {
			// TODO: game-containerをさらに入れ子にして、ユーザーの視点を切り替えられるようにしたい
			// bodyではなく中でズームin/outしてscrollする
			if (e.scale < 1.0) {
				// User moved fingers closer together
			} else if (e.scale > 1.0) {
				// User moved fingers further apart
			}
		}, false);
		
	});
})(jQuery);
