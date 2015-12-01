window.onload = function() {

  var renderer = new dagreD3.render();
  var aggregator = new Aggregator();

  var decorator = new AggregatedGraphDecorator();

  $.ajax({
    url: "data/test1.dot"
  }).done(function (data) {
    
    var $graphContainer = $('#graph-container');
    var graphs = graphlibDot.readMany(data);
    

    createSlider(0, 1440);


    g = aggregator.unionOf(graphs);
    decorator.decorate(g);
    
    g.graph().rankdir = "RL";
    g.graph().ranksep = 30;
    g.graph().nodesep = 15;

    render(g);
  });


  function render(g) {

    // Render the graphlib object using d3.
    var svg = d3.select('#graph-svg'),
        inner = svg.select("g");

    renderer(inner, g);

    // Optional - resize the SVG element based on the contents.
    var svg = document.querySelector('#graph-svg');
    var bbox = svg.getBBox();
    svg.style.width = bbox.width + 40.0 + "px";
    svg.style.height = bbox.height + 40.0 + "px";
  }
 
}