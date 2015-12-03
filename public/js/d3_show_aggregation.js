window.onload = function() {

  var renderer = new dagreD3.render();
  var aggregator = new Aggregator();

  var decorator = new AggregatedGraphDecorator();
  var nodeClickHandler = new NodeClickHandler($('#event-timeline')[0]);
    

  $.ajax({
    //url: "data/test1.dot"
    url: "data/test2.dot"
  }).done(function (data) {
    
    var $graphContainer = $('#graph-container');
    var graphs = graphlibDot.readMany(data);
    
    var minVal = 0;
    var maxVal = graphs.length;

    updateTimeIntervalLabel(graphs, minVal, maxVal);

    $("#slider-range").slider({
        range: true,
        min: minVal,
        max: maxVal,
        step: 1,
        values: [minVal, maxVal],
        slide: function (e, ui) {
          var start = ui.values[0];
          var end = ui.values[1];

          updateTimeIntervalLabel(graphs, start, end);


          var selectedGraphs = graphs.slice(start, end);
          var d0 = (new Date).getTime();
          render(selectedGraphs);
          console.log('render time: ' + ((new Date).getTime() - d0) + 'ms');
        }
    });

    render(graphs);

  });

  function updateTimeIntervalLabel(graphs, start, end){
    var startDate = getStartTime(graphs[start]);
    var endDate = getStartTime(graphs[end-1]);
    var startDateStr = startDate.toDateAndTimeStr();
    var endDateStr = endDate.toDateAndTimeStr();
    $('.slider-time').html(startDateStr);
    $('.slider-time2').html(endDateStr);
  }

  function getStartTime(g){
    var codeChangeName = g.nodes()[0];
    var codeChangeData = g.node(codeChangeName);
    return new Date(Number(codeChangeData.time));
  }


  function render(graphs) {
    var g = aggregator.unionOf(graphs);
    decorator.decorate(g);

    g.graph().rankdir = "RL";
    g.graph().ranksep = 30;
    g.graph().nodesep = 15;

    // Render the graphlib object using d3.
    var svg = d3.select('#graph-svg'),
        inner = svg.select("g");

    renderer(inner, g);



    // Resize the SVG element based on the contents.
    var svg = document.querySelector('#graph-svg');
    var bbox = svg.getBBox();
    svg.style.width = bbox.width + 40.0 + "px";
    svg.style.height = bbox.height + 40.0 + "px";

    //Add click listener
    nodeClickHandler.setGraphs(graphs);
    inner.selectAll('g.node').on('click', function (nodeName){
      nodeClickHandler.handlerFunction(nodeName);
    });
  }
 
}