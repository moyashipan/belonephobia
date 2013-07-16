function PieceTemplateManager() {
	// ユニークなtype一覧を取得
	this.piece_names = [];
	for (var key in this.piece_templates) {
		if (key == undefined) continue;
		this.piece_names.push(key);
	}
}
PieceTemplateManager.prototype = {
	piece_names: [],
	piece_templates: {
		straight:{
			body    :[[0,0]],
			bg_body :[[0,0]],
			input   :[0,1],
			outputs :[[0,-1]]
		},
		left_curve:{
			body    :[[0,0]],
			bg_body :[[0,0]],
			input   :[0,1],
			outputs :[[-1,0]]
		},
		right_curve:{
			body    :[[0,0]],
			bg_body :[[0,0]],
			input   :[0,1],
			outputs :[[1,0]]
		},
		left_turn:{
			body    :[[0,0],[-1,0]],
			bg_body :[[1,0],[0,0]], // CSSで使う座標(単にbodyのx,yの最小値を0に揃えただけ)
			input   :[0,1],
			outputs :[[-1,1]]
		},
		right_turn:{
			body    :[[0,0],[1,0]],
			bg_body :[[0,0],[1,0]],
			input   :[0,1],
			outputs :[[1,1]]
		},
		side_branch:{
			body    :[[0,0]],
			bg_body :[[0,0]],
			input   :[0,1],
			outputs :[[1,0],[-1,0]]
		},
		triple_branch:{
			body    :[[0,0]],
			bg_body :[[0,0]],
			input   :[0,1],
			outputs :[[1,0],[-1,0],[0,-1]]
		},
		block:{
			body    :[[0,0]],
			bg_body :[[0,0]],
			input   :null,
			outputs :null
		}
	},
	getTemplate:function(type){
		return this.piece_templates[type];
	}
}

