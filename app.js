var express = require('express');
var app = express();
var mongoose = require('mongoose');
var passport = require('passport');
var passportLocal = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');
var colors = require('colors');
var bodyParser = require('body-parser');


mongoose.connect('mongodb://localhost/user-auth');

// Creating the user model for Auth.=================
var UserSchema = new mongoose.Schema({
    user : String,
    password : String,
    food : String
});

//Plugin Passport Local Mongoose to Mongoose Schema.
UserSchema.plugin(passportLocalMongoose);

var User = mongoose.model('Users', UserSchema);

//===================================================

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended : true}));
//======================================
// --- Middleware so we can use sessions.
app.use(require('express-session')({
    secret : 'This can be anything',
    resave : false,
    saveUninitialized : false
}));
//======================================

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
    passport.use(new passportLocal(User.authenticate()));
//======================================
// --- Middleware so we can use passport
app.use(passport.initialize());
app.use(passport.session());
//======================================

app.get('/', function(req,res){

  //If user is logged in, log them out.
    if (!(req.user === 'undefined')){
      req.logout();
  };
  res.render('index');
});

app.post('/', passport.authenticate('local', {
    successRedirect : '/secret',
    failureRedirect : '/'
}),function(req,res){
      //You don't really do much here.
});


var user_name;
var user_id;


app.get('/secret', authenticationMiddleware(), function(req,res){

     user_name = req.user.username;
     user_id = req.user._id

  var customFood = req.user.food;


    res.render('secret', {user : user_name, food : customFood});

});

app.get('/food', authenticationMiddleware(), function(req,res){

 var myfood = req.query.food;

 User.findByIdAndUpdate(user_id, {food : myfood}, function(err,usr){
   if(err){
     console.log(err);
   }else{
     console.log(usr);
   }
 });

  res.redirect('/secret');

});

app.get('/deletekey', function(req,res){

  User.findByIdAndUpdate(user_id, {food : ''}, function(err,usr){
    if(err){
      console.log(err);
    }else{
      console.log(usr);
    }
  });

res.redirect('/secret');

});

app.get('/register', function(req,res){

//If user is logged in, log them out.
  if (!(req.user === 'undefined')){
    req.logout();
};
    res.render('register');

});

app.post('/register', function(req,res){

    User.register(new User({username : req.body.username}),req.body.password, function(err,body){
        if(err){
            console.log(err);
        }else{
            passport.authenticate('local')(req,res,function(){
                res.redirect('/');
            });
        }
    });
});

app.get('/logout', function(req,res){
    req.logout();
    res.redirect('/');
});


//Middleware for authentication.
function authenticationMiddleware(){
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }else{
      res.redirect('/')
    }
  };
};


app.listen('3000', function(){
    console.log('======================='.blue);
    console.log('Listening on port 3000'.blue);
    console.log('======================='.blue);
});





// To implement authorization in an express application, we need 4 tools.
//- passport
//- passport-local
//- passport-local-mongoose
//- express-session(times session that someone is logged in for the http req.)
