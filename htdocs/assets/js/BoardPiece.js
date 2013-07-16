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
	dom: null,
	setPosition:function(x, y){
		this.x = x;
		this.y = y;
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
		this.body    = piece.body;
		this.input   = piece.input;
		this.outputs = piece.outputs;
		return this;
	},
	getInputPath:function(){
	},
	getOutputPaths:function(){
	},
	draw:function(){
		this.dom
			.removeClass(belonephobia.util.cssFilter())
			.addClass('rotate_' + this.rotation);
		if (this.type) {
			this.dom
				.addClass('type_' + this.type)
				.addClass('player_' + this.player_id);
		}
	}
};


