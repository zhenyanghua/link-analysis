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
		'MATCH (n)-[r0]-()',
		'RETURN n, r0'
	].join('\n');

	var params = {

	};

	db.cypher({
		query: query,
		params: params
	}, function(err, results) {
		if (err) throw err;
		// console.log(results)

		var query = [
			'MATCH (n)-[]->(m)-[]->(n)',
			'RETURN n,m'
		].join('\n');

		db.cypher({
			query: query,
			params: params
		}, function(err, bidirectional) {
			if (err) throw err;
			console.log(bidirectional)
			// Reformat Relationships to d3 format.
			var newRelationships = {}
			var relationshipsObj = results.forEach(function(obj) {
				var rObj = {};
				rObj.source = obj.r0._fromId;
				rObj.target = obj.r0._toId;
				rObj.type = obj.r0.type;
				var id = rObj.source + '_' + rObj.target;
				newRelationships[id] = rObj;
			});

			// console.log(bidirectional)
			bidirectional.forEach(function(each) {
				console.log(each.n._id)
				console.log(each.m._id)
				newRelationships[each.n._id + '_' + each.m._id].bidirectional = true;
				newRelationships[each.m._id + '_' + each.n._id].bidirectional = true;
			})
			reformattedRelationships = _.map(newRelationships, function(val) { return val;});
			console.log(reformattedRelationships)

			// Reformat Nodes to d3 format.
			// ToDo
			var nodes = {};
			results.forEach(function(obj) {
				// console.log(obj.n._data)
				var id = obj.n._id;
				var prop = obj.n.properties;
				prop['labels'] = obj.n.labels[0];
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
		});
		
	});
};

/* 
Neo4jHandler.prototype.constructQueryString
return [Object]
Construct cypher query string from the data sent from client.
*/
Neo4jHandler.prototype.constructQueryString = function(data) {
	// Loop through relationship types
	var where = '(n:' + data.label + ')-[r]-(child)';
	if (data.relationships){
		where = data.relationships.map(function(relationshipName) {
			return '(n:' + data.label + ')-[r:' + relationshipName + ']-(child)';
		}).join(' OR ');
	}
	
	// Data filters and condition Strings
	if (data.filters && data.condition) {

		where += ' AND (';
		var condition = data.condition;
		switch (condition.toLowerCase()) {
			case 'all':
				where += data.filters.map(function(filter) {
					var key = Object.keys(filter)[0].split('-')[1];
					return 'n.' + filter['prop-' + key].toLowerCase() + filter['operator-' + key] + '"' + filter['prop_value-' + key] + '"'
				}).join(' AND ');
				break;
			case 'any':
				where += data.filters.map(function(filter) {
					var key = Object.keys(filter)[0].split('-')[1];
					return 'n.' + filter['prop-' + key].toLowerCase() + filter['operator-' + key] + '"' + filter['prop_value-' + key] + '"'
				}).join(' OR ');
				break;
			case 'none':
				where += 'NOT('
				where += data.filters.map(function(filter) {
					var key = Object.keys(filter)[0].split('-')[1];
					return 'n.' + filter['prop-' + key].toLowerCase() + filter['operator-' + key] + '"' + filter['prop_value-' + key] + '"'
				}).join(' OR ');
				where += ')'
		}
		
		where += ')';
	}


	// Optional Match the depth of relationship
	var queryString = (function(depth) {
		var matchString;
		if (depth == "1") {
			matchString = 'Optional MATCH (x:false)-[rc]-(m)';
		} else if (depth == "All") {
			matchString = 'Optional MATCH (child)-[rc*]-(m)';
		} else {
			matchString = 'Optional MATCH (child)-[rc*1..' + (parseInt(depth) - 1) + ']-(m)';
		}

		return {
			optionalMatchString: matchString
		};
	})(data.depth);

	var query = [
		'MATCH (n)-[r]-(child)',
		'WHERE ' + where,
		queryString.optionalMatchString,
		'RETURN child,r,m,rc'
	].join('\n');

	return query;
};

/*
Neo4jHandler.prototype.search
return null
Execute db.cypher and get query result and send to client.
*/ 
Neo4jHandler.prototype.search = function(res, query, params) {

	db.cypher({
		query: query,
		params: params
	}, function(err, results) {
		if (err) throw err;

		// Reformat Relationships to d3 format.
		// [r] -- return single Object
		var reformattedRelationships_r = results.map(function(obj) {
			var rObj = {};
			rObj.source = obj.r._fromId;
			rObj.target = obj.r._toId;
			rObj.type = obj.r.type;
			return rObj;
		});
		var reformattedRelationships_rc = [];
		// [rc] -- return an Object list
		results.forEach(function(obj) {
			if (!obj.rc) return null;

			_.each(obj.rc, function(rc) {
				var rObj = {};
				rObj.source = rc._fromId;
				rObj.target = rc._toId;
				rObj.type = rc.type;
				reformattedRelationships_rc.push(rObj);
			});
			
		});

		var tempRelationships = _.union(reformattedRelationships_r, reformattedRelationships_rc)
		var reformattedRelationships = [];
		_.each(tempRelationships, function(obj) {
			if (!utils.containsObject(obj, reformattedRelationships) && obj != null) reformattedRelationships.push(obj);
		});

		// Reformat Nodes to d3 format.
		var nodes = {};
		// (child) -- return single Object
		results.forEach(function(obj) {
			var id = obj.child._id;
			var prop = obj.child.properties;
			prop['id'] = id;
			prop['labels'] = obj.child.labels[0];
			if (!nodes[id]) nodes[id] = prop;
		});
		// (m) -- return single Object
		results.forEach(function(obj) {
			if (!obj.m) return;

			var id = obj.m._id;
			var prop = obj.m.properties;
			prop['id'] = id;
			prop['labels'] = obj.m.labels[0];
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

