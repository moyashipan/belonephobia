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

							var damages = belonephobia.getDamages();
							var has_damage = (damages.join('') != '0000');
							// if (has_damage) {
							// 	alert('1ターン目はダメージを与える手は打てません');
							// 	// TODO:setToBoardの結果を戻す
							// 	return;
							// }
							belonephobia.drawDamages(damages);
							belonephobia.drawNextPoints();
							belonephobia.nextTurn();
							break;
						};
					}); 
				pieces.append(_piece);
			}
		}

		belonephobia.init();
	});
})(jQuery);
