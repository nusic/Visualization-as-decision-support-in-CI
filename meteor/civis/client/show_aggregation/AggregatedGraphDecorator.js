AggregatedGraphDecorator = function (){
	this.numAggregatedGraphs = null;
}

AggregatedGraphDecorator.prototype.decorate = function(g, selectedNode){

	this.numAggregatedGraphs = g.numAggregatedGraphs;
	var thisDecorator = this;

	g.nodes().forEach(function (id){
		var node = g.node(id);
		thisDecorator.decorateNode(node);
		if(id === selectedNode){
			thisDecorator.styleSelectedNode(node);
		}
	});

	g.edges().forEach(function(edge){
		var edgeData = g.edge(edge);
		edgeData.label = edgeData.type;
	});

	g.graph().rankdir = "RL";
	g.graph().ranksep = 30;
	g.graph().nodesep = 15;

	this.numAggregatedGraphs = null;
}

AggregatedGraphDecorator.prototype.styleSelectedNode = function(node) {
	node.style += 'stroke: #f00;'
	node.style += 'stroke-width: 3px;'
	//node.style += 'stroke-dasharray: 10, 5;';
};



AggregatedGraphDecorator.prototype.addTypeToLabel = function(node) {
	var typeStr = node.type.replace(/_/g,' '); //Replace '_' with ' '
	typeStr = typeStr.charAt(0).toUpperCase() + typeStr.slice(1); //Capitalize first letter
	node.label += typeStr;
}

AggregatedGraphDecorator.prototype.colorCodePassFail = function(node) {
	if(node.status === 'passed') node.style += 'fill: #afa;';
	if(node.status === 'failed') node.style += 'fill: #faa;';
};

AggregatedGraphDecorator.prototype.decorateNode = function(node) {
	node.label = '';
	node.style = '';

	// applies to node types: patch_verification, code_review, build and test
	this.addTypeToLabel(node);
	node.label += ' (' + node.count + '/' + this.numAggregatedGraphs + ')';
	//node.label += ' (' + node.maxNodeIndex + ')'

	this[node.type](node);
};




AggregatedGraphDecorator.prototype.code_change = function(node){
	node.shape = 'circle';
}

AggregatedGraphDecorator.prototype.code_review = function(node){
	this.passable(node);
}

AggregatedGraphDecorator.prototype.patch_verification = function(node){
	this.passable(node);
}

AggregatedGraphDecorator.prototype.build = function(node){
	this.passable(node);
}

AggregatedGraphDecorator.prototype.test_A = function(node){
	this.passable(node);
}

AggregatedGraphDecorator.prototype.test_B = function(node){
	this.passable(node);
}

AggregatedGraphDecorator.prototype.test_C = function(node){
	this.passable(node);
}

AggregatedGraphDecorator.prototype.test_D = function(node){
	this.passable(node);
}

function decorateTransparencyAndBorder(node, color, t){
	var alpha = Math.pow(t, 1);
	node.style = 'fill: rgba('+ color.r + ',' + color.g + ',' + color.b + ','+ alpha +');';

	var borderDash = {
		length: 50*t*t*t,
		gap: 50*(1-t)*(1-t)*(1-t)
	};

	//node.style+= 'stroke-dasharray: ' + borderDash.length + ' ' + borderDash.gap + ';';
}


AggregatedGraphDecorator.prototype.passable = function(node){
	node.label += '\npassed: ' + node.passed + '/' + (node.passed + node.failed);
	var passRatio = node.passed / (node.passed + node.failed);

	var passColor = {r: 0, g: 255, b: 0};
	var failColor = {r: 255, g: 0, b: 0};
	var c = this.interpolateColors(failColor, passColor, passRatio);

	var executionRatio = node.count / this.numAggregatedGraphs;
	
	decorateTransparencyAndBorder(node, c, executionRatio);
	
}

AggregatedGraphDecorator.prototype.artifact = function(node){
	node.shape = 'circle';
	node.style += 'fill: #aaf;';
}

AggregatedGraphDecorator.prototype.confidence_level = function(node){
	node.shape = 'circle';
	node.label += '\nAvg value: ' + (node.sumValue / node.count).toFixed(2);
	
	var avgValue = node.sumValue / node.count;

	var passColor = {r: 0, g: 255, b: 0};
	var failColor = {r: 255, g: 0, b: 0};
	var c = this.interpolateColors(failColor, passColor, avgValue);

	var executionRatio = node.count / this.numAggregatedGraphs;
	decorateTransparencyAndBorder(node, c, executionRatio);
}



AggregatedGraphDecorator.prototype.interpolateColors = function(c1, c2, t){
	return {
		r: Math.round(c2.r*t + c1.r*(1-t)),
		g: Math.round(c2.g*t + c1.g*(1-t)),
		b: Math.round(c2.b*t + c1.b*(1-t))
	};
}

