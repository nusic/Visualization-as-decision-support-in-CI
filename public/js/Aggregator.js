 
var Aggregator = function(){

}

Aggregator.prototype.aggregationMethodMap = {
	code_change: 'default',
	patch_verification: 'passable',
	build: 'passable',
	code_review: 'passable',
	test_A: 'passable',
	test_B: 'passable',
	test_C: 'passable',
	test_D: 'passable',
	artifact: 'default',
	confidence_level: 'confidence_level',
}

Aggregator.prototype.unionOf = function(graphs){
	var unionGraph = new dagreD3.graphlib.Graph()
		.setGraph({});

	//Keep track of how many graphs there were
	unionGraph.numAggregatedGraphs = graphs.length;
	for (var i = 0; i < graphs.length; i++) {
		var graphNodes = graphs[i].nodes();
		for (var j = 0; j < graphNodes.length; j++) {
			var nodeName = graphNodes[j];
			var nodeData = graphs[i].node(nodeName);

			var aggregationMethod = this.aggregationMethodMap[nodeData.type];

			this[aggregationMethod](unionGraph, nodeData);
		};

		var graphEdges = graphs[i].edges();
		for (var j = 0; j < graphEdges.length; j++) {
			var edge = graphEdges[j];
			var edgeData = graphs[i].edge(edge);

			var srcNodeData = graphs[i].node(edge.v);
			var dstNodeData = graphs[i].node(edge.w);

			var unionEdge = unionGraph.edge( { v: srcNodeData.type, w: dstNodeData.type } );
			if(unionEdge === undefined){
				unionGraph.setEdge(srcNodeData.type, dstNodeData.type, edgeData);
			}
		};
	};

	return unionGraph;
}

Aggregator.prototype.passable = function(unionGraph, nodeData) {
	if(unionGraph.node(nodeData.type) === undefined){
		unionGraph.setNode(nodeData.type, { 
			type: nodeData.type,
			count: 0, 
			passed: 0, 
			failed: 0,
		});
	}
	var unionNode = unionGraph.node(nodeData.type);
	unionNode.count++;
	if(nodeData.status){
		unionNode[nodeData.status]++;
	}

}

Aggregator.prototype.default = function(unionGraph, nodeData) {
	if(unionGraph.node(nodeData.type) === undefined){
		unionGraph.setNode(nodeData.type, { 
			type: nodeData.type,
			count: 0,
		});
	}
	var unionNode = unionGraph.node(nodeData.type);
	unionNode.count++;	
};

Aggregator.prototype.confidence_level = function(unionGraph, nodeData) {
	if(unionGraph.node(nodeData.type) === undefined){
		unionGraph.setNode(nodeData.type, { 
			type: nodeData.type,
			count: 0,
			sumValue: parseFloat(nodeData.value),
		});
	}
	
	var unionNode = unionGraph.node(nodeData.type);
	unionNode.count++;
	unionNode.sumValue += parseFloat(nodeData.value);

};