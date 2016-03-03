GraphCollection = function(graphs){
	this.graphs = graphs;
	this.typeMap = this.initTypeMap();
	var self = this;
	this.byType = {
		graphs: function(type){
			return self.typeMap[type].map(function(o){ return o.graph });
		},
		nodes: function(type){
			return self.typeMap[type].map(function(o){ return o.node });
		},
		nodeDatas: function(type){
			return self.typeMap[type].map(function(o){ return o.nodeData })	;
		}
	};
}


GraphCollection.prototype.initTypeMap = function() {
	var typeMap = {};
	for(var g = 0; g<this.graphs.length; ++g){
		var graph = this.graphs[g];
		var nodes = graph.nodes();
		for(var n = 0; n<nodes.length; ++n){
			var node = nodes[n];
			var nodeData = graph.node(node);
			var type = nodeData.type;

			if(typeMap[type] === undefined){
				typeMap[type] = [];
			}
			typeMap[type].push({
				graph: graph,
				node: node,
				nodeData: nodeData
			});
		}
	}

	for(type in typeMap){
		typeMap[type] = typeMap[type].sort(function(a, b){
			return a.nodeData.time.localeCompare(b.nodeData.time);
		});
	}

	return typeMap;
};

GraphCollection.prototype.nodesByType = function(type) {
	return this.typeMap[type].map(function(o){
		return o.node;
	});
};

GraphCollection.prototype.graphsByType = function(type) {
	return this.typeMap[type].map(function(o){
		return o.graph;
	});
};

GraphCollection.prototype.nodesDataByType = function(type) {
	return this.typeMap[type].map(function(o){ 
		return o.nodeData; 
	});
};

function binarySearch(incSortedArr, val, start){
	function search(left, right){
		if(left === right) return incSortedArr[right] === val ? right : -1;
		var mid = (left + right) >> 1;
		var midVal = incSortedArr[mid];
		return midVal > val ? search(left, mid-1) :
				midVal < val ? search(mid+1, right) : mid;
	}
	start = start || {};
	var startLeft = start.left || 0;
	var startRight = start.right || incSortedArr.length;
	return search(startLeft, startRight);
}

GraphCollection.prototype.getGraphsByTypeAndTime = function(type, startTime, endTime) {
	if(startTime > endTime) throw new Error('startTime cannot be larger than endTime');

	var results = this.typeMap[type];
	var nodeTimes = results.map(function(result){
		return result.nodeData.time;
	});

	var start = binarySearch(nodeTimes, startTime);
	var end = binarySearch(nodeTimes, endTime, {left: start});

	return results.slice(start, end).map(function(result) {return result.graph; });
};

GraphCollection.prototype.getGraphsContainingNodeType = function(type){
	return this.typeMap[type].map(function(o){
		return o.graph;
	})
}
