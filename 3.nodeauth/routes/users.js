var express = require('express');
var router = express.Router();
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var User = require("../models/users");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render("register",{
  	"title":"Register"
  })
});

router.get("/login", function(req, res, next){
	res.render("login", {
		"title" : "Login"
	})
});

router.post("/register", function(req, res, next){
	// Get the form values

	var name= req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Check for Image Field
	if(req.files.profileimage){
		console.log("uploading files !!!");

		//File info
		var profileImageOriginalName = req.file.profileimage.originalname;
		var profileImageName = req.files.profileImage.name;
		var profileImageMime = req.files.profileImage.mimetype;
		var profileImagePath = req.files.profileImage.path;
		var profileImageExt  = req.files.profileImage.extension;
		var profileImageSize = req.files.profileImage.size;
	}
	else
	{
		var profileImageName ="noimage.png"
	}

	//form validation
	req.checkBody("name","Name field is required").notEmpty();
	req.checkBody("email","Email field is required").notEmpty();
	req.checkBody("email","Email not valid").isEmail();
	req.checkBody("username","Username field is required").notEmpty();
	req.checkBody("password","Password field is required").notEmpty();
	req.checkBody("password2","passwords do not match").equals(req.body.password);

	// Check for errors
	var errors = req.validationErrors();

	if(errors){
		res.render("Register", {
			errors:errors,
			name: name,
			email:email,
			username: username,
			password: password,
			password2: password2
		})
	}
	else
	{
		var newUser = new User({
			name: name,
			email:email,
			username: username,
			password: password,
			profileimage: profileImageName 
		});

		// Create user

		User.createUser(newUser, function(err, user){
			if(err){
				throw err;
			}
			console.log(user);
		})

		// Success Message
		req.flash("success","You are now registered and may login");
		res.location("/");
		res.redirect("/");
	}
});

passport.serializeUser(function(user, done){
	done(null, user.id)
});

passport.deserializeUser( function(id, done){
		User.getUserById(id, function(err, user){
		done(err, user);
	})
})

passport.use(new LocalStrategy(
		function(username, password, done){
			console.log("Username is " + username);
			console.log("Password is " + password);
			User.getUserByUsername(username, function(err, user){
				if(err){
					throw err;
				}
				console.log("User by Name: " + JSON.stringify(user));
				if(!user){
					console.log("Unknown User");
					return done(null, false,{message: "Unknown User"})
				}
			
				console.log("Password is " + password);
				console.log("user data is " + JSON.stringify(user));
				User.comparePassword(password, user.password, function(err, isMatch){
					if(err) throw err;
					if(isMatch){
						return done(null, user);
					}else{
						console.log("Invalid Password");
						return done(null, false, {message: "Invalid password"})
					}
				})
			})
		}
	))

router.post("/login", passport.authenticate("local", {
	failureRedirect:"/users/login",
	failureFlash: "Invalid username or password"
}), function(req, res){
	console.log("Authentication Successful");
	req.flash("Success", "you are logged in")
	res.redirect("/");
});

router.get("/logout", function(req, res){
	req.logout();
	req.flash("Success", "you have logged out");
	res.redirect("/users/login");
});
module.exports = router;
