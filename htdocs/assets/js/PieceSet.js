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
		this.template = belonephobia.piece_templates[this.type];
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

