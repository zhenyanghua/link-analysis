var _ = require("underscore");

module.exports = function(app, passport) {

	var Neo4jHandler = require('./modules/neo4j-handler.js');
	var neo4jHandler = new Neo4jHandler();

	app.get('/', function(req, res) {
		res.render('index');
	});

	app.get('/login', function(req, res) {
		// render the page and pass in any flash data if it exists.
		res.render('login', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/link',
		failureRedirect: '/login',
		failureFlash: true
	}));

	app.get('/signup', function(req, res) {
		res.render('signup', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/link',
		failureRedirect: '/signup',
		failureFlash: true
	}));

	app.get('/link', /* isLoggedIn, */function(req, res) {
		// get the user out of session and pass to template
		res.render('link', function(err, result){
			// Response is sent in the handler.
			neo4jHandler.getNodesandRelationships(res, req.user);
		}); 
	})

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	// Neo4j
	app.post('/reset', function(req, res) {
		var query = [
			'MATCH (n)-[r]-()',
			'RETURN n, r'
		].join('\n');
		
		var params = {};

		neo4jHandler.search(res, query, params);
	});

	app.post('/search-related', function(req, res) {
		console.log(req.body.name);
		// Prevent Script Injection
		var keyword = req.body.name.replace(/['"*]+/g, '');
		var query = [
			'MATCH (person:Person { name: "' + keyword + '" })-[r]-(n)',
			'RETURN n, r'
		].join('\n');

		var params = {};

		neo4jHandler.search(res, query, params);
	});

	app.post('/search-where', function(req, res) {
		console.log(req.body.from);
		// Prevent Script Injection
		var keyword = req.body.from.replace(/['"*]+/g, '');

		var query = [
			'MATCH (person:Person { from: "' + keyword + '" })-[r]-(n:Person { from: "' + keyword + '" })',
			'RETURN n, r'
		].join('\n');

		var params = {};

		neo4jHandler.search(res, query, params);
	});

	app.post('/search-related-where', function(req, res) {
		console.log(req.body.from);
		// Prevent Script Injection
		var keyword = req.body.from.replace(/['"*]+/g, '');

		var query = [
			'MATCH (person:Person { from: "' + keyword + '" })-[r]-(n)',
			'RETURN n, r'
		].join('\n');

		var params = {};

		neo4jHandler.search(res, query, params);
	});

	app.post('/run-query', function(req, res) {
		// console.log(req.body);
		var data = req.body;
		
		// Loop through relationship types
		var where = '(n:' + data.label + ')-[r]-(child)';
		if (data.relationships){
			where = data.relationships.map(function(relationshipName) {
				return '(n:' + data.label + ')-[r:' + relationshipName + ']-(child)';
			}).join(' OR ');
		}
		
		if (data.filters) {

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

		console.log(query)
		var params = {};

		neo4jHandler.search(res, query, params);
	});
};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect('/');
}