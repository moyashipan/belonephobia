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
	bg_position:[0, 0],
	dom: null,
	setPosition:function(x, y){
		this.x = +x;
		this.y = +y;
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
		this.body        = piece.body;
		this.input       = piece.input;
		this.outputs     = piece.outputs;
		this.bg_position = piece.bg_position;
		return this;
	},
	getInputPath:function(){
	},
	getOutputPaths:function(){
	},
	// output先のpiecesをイテレートさせるヘルパーメソッド
	eachOutputPiece: function(callback, fail_callback){
		var outputs = this.outputs;
		if (!outputs) return;

		for (var i in outputs) {
			var position = outputs[i];
			var dx = +position[0], dy = +position[1];
			try {
				var x = this.x + dx, y = this.y + dy;
				var piece = belonephobia.board_pieces[x][y];

				callback.call(this, dx, dy, piece);
			} catch (e) {
				if (fail_callback) {
					fail_callback.call(this, dx, dy);
				}
			}
		}

	},
	draw:function(){
		this.dom
			.removeClass(belonephobia.util.cssFilter())
			.removeClass(belonephobia.util.cssFilter('pos_'))
			.addClass('rotate_' + this.rotation);
		if (this.type) {
			this.dom
				.addClass('type_' + this.type)
				.addClass('player_' + this.player_id);
		}
		if (this.bg_position[0] > 0) this.dom.addClass('pos_x_' + this.bg_position[0]);
		if (this.bg_position[1] > 0) this.dom.addClass('pos_y_' + this.bg_position[1]);
	}
};


