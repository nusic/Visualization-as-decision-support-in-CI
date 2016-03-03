CIFlowRenderer = function($containerElement, aggregator, decorator, onGraphRendered){
  this.$containerElement = $containerElement;
  this.renderer = new dagreD3.render();
  this.aggregator = aggregator;
  this.decorator = decorator;
  this.onGraphRendered = onGraphRendered;
}

CIFlowRenderer.prototype.render = function(graphs, selectedNode) {
  var resGraphs = this.aggregator ? this.aggregator(graphs) : graphs;
  resGraphs = [].concat(resGraphs);

  this.$containerElement.empty();
  resGraphs.forEach((g, i) => {
    setTimeout(() => {
      var g = resGraphs[i];

      //Add graphical properties to graph
      this.decorator.decorate(g, selectedNode);

      // Render the graphlib object using d3.
      this.$containerElement.append('<svg id="graph' + i + '"> <g> </svg>');
      var svg = d3.select('#graph' + i),
          inner = svg.select("g");

      this.renderer(inner, g);

      // Optional - resize the SVG element based on the contents.
      var svg = document.querySelector('#graph' + i);
      var bbox = svg.getBBox();
      svg.style.width = bbox.width + 40.0 + "px";
      svg.style.height = bbox.height + 40.0 + "px";

      // On graph rendered
      if(this.onGraphRendered) this.onGraphRendered(g, inner, i, graphs);

    }, 50*i);
  });
};