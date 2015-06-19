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
		var query = neo4jHandler.constructQueryString(data);

		console.log(query)
		var params = {};

		neo4jHandler.search(res, query, params);
	});
};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect('/');
}
