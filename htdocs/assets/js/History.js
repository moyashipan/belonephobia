function History() {
	this.piece_template_manager = new PieceTemplateManager;
}
History.prototype = {
	histories: [],
	_chargeObject: null,
	charge: function(action, data){
		// 操作を一時スロットに格納する
		this._chargeObject = { action:action, data:data };
		return this;
	},
	addCharge: function(){
		// 一時スロットに格納された操作を履歴に追加する
		this.histories.push(this._chargeObject);
		this._chargeObject = null;
		return this;
	},
	add: function(action, data){
		// 履歴に追加する
		this.charge(action, data).addCharge();
		return this;
	},
	undo: function(){
		if (belonephobia.turn === 1 && belonephobia.player_turn === 0) return;

		var object = this.histories.pop();
		var data = object.data;
		switch (object.action) {
		case 'set':
			belonephobia.players[data.piece_set.player_id].undoPiece(data.piece_set.type);
			data.piece_set.removeFromBoard(data.x, data.y);
			belonephobia.drawDamages(belonephobia.getDamages());
			belonephobia.drawNextPoints();
			belonephobia.prevTurn();
			break;
		}
	}
}
