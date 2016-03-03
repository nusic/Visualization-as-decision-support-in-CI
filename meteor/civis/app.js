Graphs = new Mongo.Collection('graphs');
Graphs.schema = new SimpleSchema({
  dot: {type: String, },
  contributor: {type: String},
  time: {type: Number},
});



if (Meteor.isClient) {
  angular.module('civis', ['angular-meteor','ui.router']);

  angular.module('civis').config(function ($urlRouterProvider, $stateProvider, $locationProvider) {
    //$locationProvider.html5Mode(true);
    $stateProvider
      .state('graphs', {
        url: '/graphs/:contributerName',
        template: '<graphs-list></graphs-list>'
      })
      .state('first-occurance', {
        url: '/first_occurrence/:contributerName',
        template: '<first-occurrence-list></first-occurrence-list>'
      })
      .state('aggregation', {
        url: '/aggregation',
        template: '<aggregation></aggregation>'
      });

    $urlRouterProvider.otherwise("/graphs/All");
  });




  //
  // Raw graph list
  //
  angular.module('civis').directive('graphsList', function(){
    return {
      restrict: 'E',
      templateUrl: 'graphs-list.html',
      controllerAs: 'graphsList',
      controller: function($scope, $reactive, $stateParams){
        $reactive(this).attach($scope);
          
        $scope.allDotGraphs = Graphs.find({});
        $scope.developer = $stateParams.contributerName || 'All';

        this.developer = $stateParams.contributerName || 'All';
        this.dotGraphs = getDotGraphs(this.getReactively('developer'));
        
        
        $scope.developers = ['All'].concat($scope.allDotGraphs.map((graph) => graph.contributor).getUnique());

        var renderer = new CIFlowRenderer($('#graph-container'), null, new Decorator());
        var self = this;
        this.subscribe('parsedGraphs', () => {
          var graphs = self.dotGraphs.map((g) => graphlibDot.read(g.dot) );
          renderer.render(graphs);
        });

        var $devSelect = $('#select-developer');
        $devSelect.change(onSelectUpdate);

        function onSelectUpdate(){
          var paths = location.toString().split('/');
          paths.pop();
          var newLocation = paths.join('/') + '/' + $devSelect.find(":selected").text();
          location.replace(newLocation);
        }
      }
    }
  });

  function getDotGraphs(contributor){
    var query = (!contributor || contributor === 'All') ? {} : {contributor: contributor};
    return Graphs.find(query, {sort: {'time': -1}});
  }




  //
  // First occurance list
  //
  angular.module('civis').directive('firstOccurrenceList', function(){
    return {
      restrict: 'E',
      templateUrl: 'first-occurrence-list.html',
      controllerAs: 'firstOccuranceList',
      controller: function($scope, $reactive, $stateParams, $state){
        $reactive(this).attach($scope);
        $scope.developer = $stateParams.contributerName;
        this.dotGraphs = getDotGraphs('All');

        var $devSelect = $("#select-developer");
        var dfe = new DeveloperFlowExtractor(new Aggregator());

        function agg(graphs){
          return dfe.first_occurrence(graphs, $stateParams.contributerName);
        }

        function onGraphRendered(graph, inner, i, graphs){
          // Add click listeners
          var showDeltaClickHandler = new ShowDeltaClickHandler(inner[0][0].parentNode);
          showDeltaClickHandler.setGraphs(graphs);
          showDeltaClickHandler.setGraph(graph);
          inner.selectAll('g.edgePath.indirect').on('click', function (edge){
            showDeltaClickHandler.onEdgeClick(edge);
          });
          inner.selectAll('g.node').on('click', function (node){
            showDeltaClickHandler.onNodeClick(node);
          });
        }

        var renderer = new CIFlowRenderer($('#graph-container'), agg, new Decorator(), onGraphRendered);
        
        var self = this;
        this.subscribe('parsedGraphs', () => {
          var graphIndex = 0;
          var graphs = self.dotGraphs.map((g) => {
            var o = graphlibDot.read(g.dot) 
            o.graphIndex = graphIndex++;
            return o;
          });

          populateSelectElement(self.dotGraphs);
          $devSelect.change(onSelectUpdate);
          renderer.render(graphs);
        });

        function onSelectUpdate(){
          var paths = location.toString().split('/');
          paths.pop();
          var newLocation = paths.join('/') + '/' + $devSelect.find(":selected").text();
          location.replace(newLocation);
        }

        function populateSelectElement(dotGraphs){
          ['All'].concat(dotGraphs.map( (dotGraph) => dotGraph.contributor ))
          .getUnique()
          .forEach(function (uniqueDeveloper){
            $devSelect.append($('<option>', {
              text: uniqueDeveloper,
              selected: uniqueDeveloper === $scope.developer
            }));
          });
        }
      }
    }
  });





  // 
  // Aggregation
  //
  angular.module('civis').directive('aggregation', function(){
    return {
      restrict: 'E',
      templateUrl: 'aggregation.html',
      controllerAs: 'aggregation',
      controller: function($scope, $reactive, $stateParams){
        $reactive(this).attach($scope);

        var graphContainer = $('#graph-container');
        var aggregator = new Aggregator();
        var aggfun = (graphs) => aggregator.unionOf(graphs);
        var aggfun2 = (graphs) => aggregator.unionOf(graphs, 'stack');
        var decorator = new AggregatedGraphDecorator();
        var nodeClickHandler = new TimeLineHandler('#timeline1');
        var timelineOverview = new TimeLineHandler('#timeline-overview');

        function onGraphRendered(graph, inner, i, graphs){
          nodeClickHandler.setGraphs(graphs);
           inner.selectAll('g.node').on('click', function (nodeType){
            selectedType = nodeType;
            update(graphs);
          });
        }

        var renderer = new CIFlowRenderer(graphContainer, aggfun, decorator, onGraphRendered);
        

        this.helpers({
          dotGraphs: () => getDotGraphs('All')
        });

        var selectedType = 'code_change';

        var self = this;
        var graphCollection;
        this.subscribe('parsedGraphs', () => {
          $scope.graphs = self.dotGraphs.map( 
            (dotGraph) => graphlibDot.read(dotGraph.dot)
          );
          graphCollection = new GraphCollection($scope.graphs);
          update($scope.graphs);
        });


        // Time line sliders
        var minVal = 0;
        var maxVal = this.dotGraphs.length;
        var mid = Math.ceil(maxVal/2);
        var windowSize = maxVal;
        //console.log(minVal, maxVal, mid, windowSize);

        $("#slider-time-window").slider({
          value: mid,
          min: minVal,
          max: maxVal,
          step: 1,
          slide: function (e, ui) {
              $('#timeline1').empty();
              var mid = ui.value;
              var values = $("#slider-time-range").slider('values');
              var halfWidth = Math.ceil((values[1]-values[0])/2);
              var start = Math.max(mid - halfWidth, minVal);
              var end = Math.min(mid + halfWidth, maxVal);
              $("#slider-time-range").slider('values', [start, end]);
              update(start, end);
            },
        });


        $("#slider-time-range").slider({
            range: true,
            min: minVal,
            max: maxVal,
            step: 1,
            values: [minVal, maxVal],
            slide: function (e, ui) {
              $('#timeline1').empty();
              var start = ui.values[0];
              var end = ui.values[1];
              var mid = Math.ceil( (start + end)/2 );
              $("#slider-time-window").slider('value', mid);
              update(start, end);
            },
        });

        function update(start, end){
          var graphs = graphCollection.graphsByType(selectedType);
          var selectedGraphs = graphs.slice(start, end);

          var nodeDatas = graphCollection.nodesDataByType(selectedType);
          console.log(nodeDatas.map(function(n){
            return n.time;
          }));
          
          timelineOverview.setGraphs($scope.graphs);
          nodeClickHandler.setGraphs(selectedGraphs);

          updateTimeIntervalLabel(selectedGraphs);
          renderer.render(selectedGraphs, selectedType);

          timelineOverview.handlerFunction(selectedType);
          nodeClickHandler.handlerFunction(selectedType);
        }

        function updateTimeIntervalLabel(selectedGraphs){
          var firstGraph = selectedGraphs[0];
          var lastGraph = selectedGraphs[selectedGraphs.length-1];
          var startDate = getStartTime(firstGraph);
          var endDate = getStartTime(lastGraph);
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
      }
    };
  });

}

