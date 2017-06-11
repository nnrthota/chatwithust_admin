var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
mongoose.connect('mongodb://narendranath:Naththota.1@ds028540.mlab.com:28540/chatwithust');
var db=mongoose.connction;  

var User = require('../models/user');
var Agent = require('../models/agent');
// to get Register page

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg','Please Provide admin details to login');
        res.redirect('/admin/login');
    }
}

// Login
router.get('/login', function(req, res){
	res.render('login');
});
router.get('/',function(req, res){
  res.redirect('/chat/login');
});
//get data
router.get('/getChatHistory',ensureAuthenticated, function(req, res, next) {
  var resultArray = [];
  mongo.connect('mongodb://narendranath:Naththota.1@ds028540.mlab.com:28540/chatwithust', function(err, db) {
    var cursor = db.collection('messages').find();
    cursor.forEach(function(doc, err) {
      resultArray.push(doc);
    }, function() {
      db.close();
      res.render('dashboard', {items: resultArray});
    });
  });
});
router.get('/listUsers',ensureAuthenticated, function(req, res, next) {
  var resultUsers = [];
  mongo.connect('mongodb://narendranath:Naththota.1@ds028540.mlab.com:28540/chatwithust', function (err, db) {
    var cursor = db.collection('users').find();
    cursor.forEach(function(doc, err) {
      resultUsers.push(doc);
    }, function() {
      db.close();
      res.render('dashboard', {users: resultUsers});
    });
  });
});


router.post('/delete',ensureAuthenticated, function(req, res, next) {
  var id = req.body.id;
  req.checkBody('id', 'ID is required').notEmpty();
  var errors = req.validationErrors();

	if(errors){
		res.render('dashboard',{
			errors:errors
		});
	} else if(id.length !==24){
		res.render('dashboard');
	}else {  

	    mongo.connect('mongodb://narendranath:Naththota.1@ds028540.mlab.com:28540/chatwithust', function (err, db) {
    db.collection('users').deleteOne({"_id": objectId(id)}, function(err, result) {
      db.close();
      if(err) throw err;
    });
  });
}
});

// to post user details through Register page to data base 
router.post('/insert',ensureAuthenticated, function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	
	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
	var errors = req.validationErrors();
	if(errors){
		res.render('dashboard',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name: name,
			email:email,
			username: username,
			password: password
		});
			User.createUser(newUser, function(err, user){
			if(err) throw err;
		});
		  
		req.flash('success_msg', 'New user has been Registered');	
	}
});
passport.use(new LocalStrategy(
  function(username, password, done) {
	  
	  
	  
   Agent.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	Agent.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  Agent.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/admin/dashboard', failureRedirect:'/admin/login',failureFlash: true}),
  function(req, res) {  
    res.redirect('/dashboard');
  });

router.get('/logout', function(req, res){
	req.logout();
	req.flash('success_msg', 'You are logged out');	
	res.redirect('/admin/login');
});


module.exports = router;
