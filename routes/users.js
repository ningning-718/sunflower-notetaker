var express = require('express');
var router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('../models/user');

passport.use(new LocalStrategy(function verify(username, password, cb) {
  User.findOne({username: username}, (err, user) => {
    if (err) { return cb(err); }
    if (!user) { return cb(null, false, { message: 'Incorrect username or password.' }); }
    if (!(user.password == password)) { return cb(null, false, { message: 'Incorrect username or password.' }); }
    return cb(null, user);
  });
}));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.redirect('/');
});

/* user login page*/
router.get('/login', function(req, res, next) {
  if (req.isAuthenticated()) {
    req.logout({}, ()=>{
      res.redirect('/');
    });    
  }
  else {
    res.render('login', {authed: false});
  }  
});

/* user login page*/
router.post('/login/password', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login'
}));

module.exports = router;
