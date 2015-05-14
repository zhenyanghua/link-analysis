var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
	local: {
		email: String,
		password: String,
		fname: String,
		lname: String,
	},
})

// generate a hash
userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

// check if password if valid
userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
}

// create the model for users and expose it to the app
module.exports = mongoose.model('User', userSchema);