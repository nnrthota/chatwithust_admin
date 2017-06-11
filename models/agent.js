var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User and Admin Schema
var Schema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	name: {
		type: String
	}
});


var Agent = module.exports = mongoose.model('agents', Schema);

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	Agent.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	Agent.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}
