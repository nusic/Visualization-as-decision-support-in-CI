/*
 * This code generates mockup CI work flow data. 
 *
 * Author: Erik Broberg, 2015
 *
 */

var graphlib = require("graphlib");

var CINodeFactory = require('./CINodeFactory.js').CINodeFactory;
var Graph = require('./CIGraph.js').Graph;

var g = new Graph();
g.nodeFactory = new CINodeFactory();


g.set('code_change') // 0
	.cause(['patch_verification', 'review']) // 1, 2
		.set('build').causedBy([1, 2]) // 3
			.cause(['test', 'test', 'artifact']) // 4, 5, 6
				.set('confidence_level').causedBy([4, 5]).subjectTo(6) // 7
					.cause(['test', 'test']) // 8, 9


console.log(graphlib.json.write(g));