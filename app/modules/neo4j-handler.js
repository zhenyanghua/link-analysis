var neo4j = require('neo4j');
var _ = require("underscore");
var utils = require('./utils.js');


// Connect to DB.
var db = new neo4j.GraphDatabase('http://neo4j:admin@localhost:7474');

// Private constructor:
var Neo4jHandler = module.exports = function Neo4jHandler() {

};

// Public instance methods:
Neo4jHandler.prototype.getNodesandRelationships = function(res, user) {
	var query = [
		'MATCH (n)-[r]-()',
		'RETURN n, r'
	].join('\n');

	var params = {

	};

	db.query(query, params, function(err, results) {
		if (err) throw err;
		var query = [
			'MATCH (n)-[]->(m)-[]->(n)',
			'RETURN n,m'
		].join('\n');

		db.query(query, params, function(err, bidirectional) {

			
			// Reformat Relationships to d3 format.
			var newRelationships = {}
			var relationshipsObj = results.forEach(function(obj) {
				var rObj = {};
				rObj.source = utils.getEndPointString(obj.r._data.start);
				rObj.target = utils.getEndPointString(obj.r._data.end);
				rObj.type = obj.r._data.type;
				var id = rObj.source + '_' + rObj.target;
				newRelationships[id] = rObj;
			});

			// console.log(bidirectional)
			bidirectional.forEach(function(each) {
				console.log(each.n._data.metadata.id)
				console.log(each.m._data.metadata.id)
				newRelationships[each.n._data.metadata.id + '_' + each.m._data.metadata.id].bidirectional = true;
				newRelationships[each.m._data.metadata.id + '_' + each.n._data.metadata.id].bidirectional = true;
			})
			reformattedRelationships = _.map(newRelationships, function(val) { return val;});
			console.log(reformattedRelationships)

			// Reformat Nodes to d3 format.
			// ToDo
			var nodes = {};
			results.forEach(function(obj) {
				// console.log(obj.n._data)
				var id = obj.n._data.metadata.id;
				var prop = obj.n._data.data;
				prop['labels'] = obj.n._data.metadata.labels[0];
				prop['id'] = id;
				if (!nodes[id]) nodes[id] = prop;
			});

			
			// Stringify to json string, when it gets to client side, 
			// it will be part of the {results: resultArray} json object,
			// so no need to parse back to json object.
			var relationships = JSON.stringify(reformattedRelationships);
			var nodeObject = _.values(nodes);
			console.log(nodeObject)
			var nodes = JSON.stringify(nodeObject);
			res.render('link', { relationships: relationships, nodeObject: nodeObject, nodes: nodes, user: user });
		})
		
	});
};

Neo4jHandler.prototype.search = function(res, query, params) {

	db.query(query, params, function(err, results) {
		if (err) throw err;
		console.log(results)
		// Reformat Relationships to d3 format.
		var reformattedRelationships = results.map(function(obj) {
			var rObj = {};
			rObj.source = utils.getEndPointString(obj.r._data.start);
			rObj.target = utils.getEndPointString(obj.r._data.end);
			rObj.type = obj.r._data.type;
			return rObj;
		});
		// Reformat Nodes to d3 format.
		// ToDo
		var nodes = {};
		results.forEach(function(obj) {
			var id = obj.n._data.metadata.id;
			var prop = obj.n._data.data;
			prop['id'] = id;
			if (!nodes[id]) nodes[id] = prop;
		});

		// Stringify to json string, when it gets to client side, 
		// it will be part of the {results: resultArray} json object,
		// so no need to parse back to json object.
		var relationships = reformattedRelationships;
		var nodeObject = _.values(nodes);
		var nodes = JSON.stringify(nodeObject);
		res.send( { 
			relationships: relationships,
			nodeObject: nodeObject, 
			nodes: nodes
		});
	});
}

