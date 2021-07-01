const express = require('express');
const helmet = require('helmet');
var passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const port = process.env.PORT || 9000
var router = require("./router");

var fs = require('fs');
const app = express();

app.use(express.urlencoded({
  extended: true,
}));

app.use(express.json({ limit: '15mb' }));
app.use(helmet());
const certificate = fs.readFileSync("./idp.pem", { encoding: "utf8" });

//passport
passport.use(new SamlStrategy(
  {
    callbackUrl: 'http://localhost:9000/login/sso/callback',
    entryPoint: 'https://thoughticompany-dev.onelogin.com/trust/saml2/http-post/sso/22d1715c-2c54-40d5-8f82-f33160813e54',
    issuer: 'https://app.onelogin.com/saml/metadata/22d1715c-2c54-40d5-8f82-f33160813e54',
    signatureAlgorithm: 'sha1',
    cert: certificate,
  },
  function (profile, done) {
    return done(null, profile);
  }
));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});


app.use(passport.initialize());
app.use(passport.session());


//= ==========Registering Router==========
app.use(router);

app.listen(port, function (err) {
  if (err) {
    console.log("Server creation error..");
  } else {
    console.log("Server is running on.." + port);
  }
});

module.exports = app;
