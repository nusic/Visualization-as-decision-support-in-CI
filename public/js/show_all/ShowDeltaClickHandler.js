function ShowDeltaClickHandler(element){
	this.element = element;
	this.graphs;
	this.graph;


	this.baseMessage = '<h4>Included code changes:</h4>';
	this.$messageElement = $('<div class="edge-message">'+ this.baseMessage +'</div>');
	$(element).after( this.$messageElement );
	$(this.$messageElement).after($('<hr>'));
}

ShowDeltaClickHandler.prototype.setGraphs = function(graphs) {
	this.graphs = graphs;
};

ShowDeltaClickHandler.prototype.setGraph = function(graph) {
	this.graph = graph;
	var firstNodeId = graph.nodes()[0];
	this.firstNodeGraphIndex = graph.node(firstNodeId).graphIndex;
};

ShowDeltaClickHandler.prototype.onEdgeClick = function(edge) {
	var srcNode = this.graph.node(edge.v);
	this.onNodeClick(edge.v);
};

ShowDeltaClickHandler.prototype.onNodeClick = function(node) {
	var srcNode = this.graph.node(node);
	var deltaGraphs = this.graphs.slice(this.firstNodeGraphIndex, srcNode.graphIndex+1);

	var deltaHtml = this.baseMessage + deltaGraphs.map(function (deltaGraph){
		var codeChange = deltaGraph.getCodeChange();
		var date = new Date(Number(codeChange.time));
		var dateStr = date.toDateAndTimeStr();
		return dateStr + ' - <a href="#">' + codeChange.id + '</a>' + ' (' + codeChange.contributor + ')';
	}).join('<br>');

	this.$messageElement.html(deltaHtml);
};
