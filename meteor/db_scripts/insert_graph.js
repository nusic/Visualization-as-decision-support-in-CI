var dot = require('graphlib-dot');
var exec = require('child_process').exec;
var async = require('async');
var MongoClient = require('mongodb').MongoClient;

var relPathToRoot = '../../';
var generateGraphCommand = 'node '+relPathToRoot+'generate_ci_flow -template '+relPathToRoot+'graph_templates/template.dot';
var meteorProjectURL = 'http://ci-visualization-demo.meteor.com/';
var getMongodbUrlCommand = 'meteor mongo ' + meteorProjectURL + ' --url';

var N = process.argv[2] || 1;



exec(getMongodbUrlCommand, function(error, mongo_url, stderr){
  if(error || stderr) return console.error(error || stderr);
  else console.log(mongo_url);

  MongoClient.connect(mongo_url.trim(), function(err, db){
    if(err) return console.error(err);
    
    function task(cb){
      insertDocument(db, cb);
    }

    var tasks = [];
    for (var i = 0; i < N; i++) {
      tasks.push(task);
    }
    console.log(tasks);

    async.parallel(tasks, function(err, results){
      if(err) console.error(err);
      else console.log(results.map(function(res){ return res.contributor; }));
      db.close()
    });
  });
});



function insertDocument(db, cb) {
  getNewGraphDoc(function(err, graphDoc){
    if(err) return cb(err);
    db.collection('graphs').insertOne(graphDoc);  
    cb(null, graphDoc);
  });
}


function getNewGraphDoc(cb){
  exec(generateGraphCommand, function(error, stdout, stderr) {
    if(error) return cb(error);
    if(stderr) return db(error);
    var dotGraphStr = stdout;
    var g = dot.read(dotGraphStr);

    var codeChange = g.nodes()[0];
    var contributor = g.node(codeChange).contributor
    var time = parseInt(g.node(codeChange).time);
    
    var mongooseDoc = {
      dot: dotGraphStr,
      contributor: contributor,
      time: time
    };

    //var mongooseDocStr = JSON.stringify(mongooseDoc);
    cb(null, mongooseDoc);
  }); 
}
