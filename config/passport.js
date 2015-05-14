var LocalStrategy = require('passport-local').Strategy;

var User = require('../app/models/user.js');

module.exports = function(passport) {

	// Passport session setup
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	// Local Signup
	passport.use('local-signup', new LocalStrategy({
		// by default, local strategy uses username ad password, we will override with email
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, email, password, done) {
		console.log(req)
		process.nextTick(function() {
			// find a user whose email is the same as the forms email
			// we are checking to see if the user trying to login already exists
			User.findOne({ 'local.email': email}, function(err, user) {
				if (err) return done(err);

				// check to see if there is already a user with that email
				if (user) {
					return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
				} else {
					// if there is no user with that email
					// create the user
					var newUser = new User();

					// set the user's local credentials
					newUser.local.email = email;
					newUser.local.password = newUser.generateHash(password);

					// other user settings
					newUser.local.fname = req.body.fname;
					newUser.local.lname = req.body.lname;

					// save the user
					newUser.save(function(err) {
						if (err) throw err;
						return done(null, newUser);
					});
				}
			});
		});
	}));

	// Local Login
	passport.use('local-login', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, email, password, done) {
		User.findOne({ 'local.email': email }, function(err, user) {
			if (err) return done(err);

			// if no user is found, return the message
			if (!user) return done(null, false, req.flash('loginMessage', 'No user found.'));

			// if the user if found but the password is wrong
			if (!user.validPassword(password)) return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

			// all is well, return successful user
			return done(null, user); 
		});
	}));
}