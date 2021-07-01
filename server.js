const express = require('express');
const helmet = require('helmet');
var passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const port = process.env.PORT || 9001
// const  passport  = require('./passportHandler');
var router = require("./router");

var fs = require('fs');
const server = express();

server.use(express.urlencoded({
  extended: true,
}));

server.use(express.json({ limit: '15mb' }));
server.use(helmet());
const certificate = fs.readFileSync("./oktaidp.pem", { encoding: "utf8" });

//passport
passport.use(new SamlStrategy(
  {
    callbackUrl: 'http://localhost:9001/login/sso/callback',
    entryPoint: 'https://dev-75572605.okta.com/app/dev-75572605_oktasso_1/exk14g04d0Ffs92zq5d7/sso/saml',
    issuer: 'http://www.okta.com/exk14g04d0Ffs92zq5d7',
    cert: certificate,
  },
  function (profile, done) {
    console.log('test')
    return done(null, profile);
  }
));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});


server.use(passport.initialize());
server.use(passport.session());


//= ==========Registering Router==========
server.use(router);

server.listen(port, function (err) {
  if (err) {
    console.log("Server creation error..");
  } else {
    console.log("Server is running on.." + port);
  }
});

module.exports = server;
