/* PieceSet */
function PieceSet() {
}
PieceSet.prototype = {
	type: null,
	player_id: null,
	rotation: 0, // 0,1,2,3
	template: null,
	setType:function(type){
		this.type = type;
		this.template = belonephobia.piece_template_manager.getTemplate([this.type]);
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
				input = this.calcRotation(input, this.rotation);
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
		var retval = [];
		var template = this.template;
		for (var i in template.body) {
			// 回転させた後の 原点から見た自分の相対座標
			// 1マスピースなら必ず(0, 0)
			var self_pos    = this.calcRotation(template.body[i], this.rotation);

			// 回転させた後の 自分から見た入口マスの相対座標
			var input;
			if (template.input) {
				// 両方回して差を見る
				input = this.calcRotation(template.input, this.rotation);
				input = this.calcSub(input, self_pos);
			}

			// 回転させた後の 自分から見た出口マスの相対座標
			var outputs = [];
			for (var j in template.outputs) {
				var output = this.calcRotation(template.outputs[j], this.rotation);
				output = this.calcSub(output, self_pos);
				outputs.push(output);
			}
			// TODO:座標の渡し方を統一する。配列？オブジェクト？x,yの変数？
			retval.push({
				x:self_pos[0],
				y:self_pos[1],
				bg_position: template.bg_body[i],
				body:[[0,0]], // TODO:自分から見た全体の形状を計算する
				input:input,
				outputs:outputs
			});
		}
		return retval;
	},
	// point: 変換対象の座標
	// rotatio: 角度(0,1,2,3)
	calcRotation:function(point, rotation){
		switch (rotation) {
		case 1:
			return [-point[1], point[0]];
		case 2:
			return [-point[0], -point[1]];
		case 3:
			return [point[1], -point[0]];
		case 0:
		default:
			return [point[0], point[1]];
		}
	},
	calcSub:function(a, b){
		return [a[0] - b[0], a[1] - b[1]];
	}
}

