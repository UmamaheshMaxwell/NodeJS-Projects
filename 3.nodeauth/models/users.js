var mongoose = require("mongoose");
var bycrypt = require("bcrypt");
mongoose.connect("mongodb://localhost/nodeauth");
var db = mongoose.connection;

// user Schema

var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	password: {
		type: String,
		bcrypt: true,
		required: true
	},
	email: {
		type:String
	},
	name: {
		type: String
	},
	profileimage:{
		type: String
	}

});

var User = module.exports= mongoose.model("User", UserSchema);

module.exports.createUser = function(newUser, callback){
	bycrypt.hash(newUser.password, 10, function(err, hash){
		if(err){
			throw err;
		}
		//Set hashed password
		newUser.password = hash;

		//Create user
		newUser.save(callback);
	})

}

module.exports.getUserByUsername = function(username, callback){
	console.log("getuserByusername : " + username);
	User.findOne({username: username}, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);

}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bycrypt.compare(candidatePassword, hash, function(err, isMatch){
		if(err) {
			console.log("I am inside this")
			return callback(err);
		}

		console.log("IsMatch is : " + isMatch)
		callback(null, isMatch);
	})
}