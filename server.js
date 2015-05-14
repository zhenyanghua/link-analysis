var express = require('express');
var app = express();
var exphbs = require('express-handlebars');
var port = 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');

// Serve static files
app.use(express.static(__dirname + '/public'));

// Configuration
mongoose.connect(configDB.url);

require('./config/passport')(passport); // pass passport for configuration

// Set up express app
app.use(morgan('dev')); // log every request to the console.
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

var hbs = exphbs.create({
	defaultLayout: 'main',
	helpers: {
		section: function(name, options) {
			if (!this._sections) this._sections = {};
			this._sections[name] = options.fn(this);
			return null;
		},
		checkMessage: function(message, options) {
			if(message.length > 0) return options.fn(this);
		}
	}
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch'})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes
require('./app/routes.js')(app, passport) // load routes and pass in the app and fully configured passport

// launch
app.listen(port);
console.log('The magic happens on port' + port + '....');
