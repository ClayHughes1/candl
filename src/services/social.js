require('dotenv').config();
const Facebook = require('facebook-node-sdk');
const facebook = new Facebook({ appId: process.env.FACEBOOK_APPID, secret: process.env.FACEBOOK_SECRETKEY });
const fb = require('passport-facebook');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

// console.log('facebook:     '+facebook);

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APPID,
  clientSecret: process.env.FACEBOOK_SECRETKEY,
  callbackURL: process.env.FACEBOOK_CALLBACK
},
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


const postFacebook = (facebook.api(`/1128142815279380/feed`, 'post', { message: 'Hello, world!' }, function(res) {
  if(!res || res.error) {
    console.log(!res ? 'error occurred' : res.error);
    return;
  }
  console.log('Post Id: ' + res.id);
}));

const fbAuthenticate = async() =>{
  app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
}

const fbAuthEmail = async() =>{
  passport.authenticate('facebook',{scope: 'email'}),
  function(req,res){
      Console.log('facebook authentication.......   '+res);
  }
}

// passport.use(new FacebookStrategy({
//   clientID: process.env.FACEBOOK_APPID,
//   clientSecret: process.env.FACEBOOK_SECRETKEY,
//   callbackURL: "http://localhost:3000/auth/facebook/callback"
// },
// function(accessToken, refreshToken, profile, cb) {
//   User.findOrCreate({ facebookId: profile.id }, function (err, user) {
//     return cb(err, user);
//   });
// }
// ));

module.exports = {
  postFacebook,
  fbAuthenticate,
  fbAuthEmail
}