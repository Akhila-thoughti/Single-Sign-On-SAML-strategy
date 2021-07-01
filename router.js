const router = require("express").Router();
const express = require('express');
const useragent = require('useragent');
const Saml2js = require('saml2js');
var passport = require('passport');

const userAgentHandler = (req, res, next) => {
  const agent = useragent.parse(req.headers['user-agent']);
  const deviceInfo = Object.assign({}, {
    device: agent.device,
    os: agent.os,
  });
  req.device = deviceInfo;
  next();
};


/**
 * This Route Authenticates req with IDP
 * If Session is active it returns saml response
 * If Session is not active it redirects to IDP's login form
 */
router.get('/login/sso',
  passport.authenticate('saml', {
    additionalParams: { 'username': 'akhila.reddy@thoughti.com' },
    successRedirect: '/',
    failureRedirect: '/login',
  }),

  function (req, res) {
    console.log(res, req, "res")
    res.send({
      status: true,
      message: "Success!",
    });
    res.redirect('/');
  }
);
/**
 * This is the callback URL
 * Once Identity Provider validated the Credentials it will be called with base64 SAML req body
 * Here we used Saml2js to extract user Information from SAML assertion attributes
 * If every thing validated we validates if user email present into user DB.
 * Then creates a session for the user set in cookies and do a redirect to Application
 */

createUserSession = async (req, res) => {
  var user = {
    id: 23468684,
    email: "akhila.reddy@thoughti.com",
    firstName: "Akhila",
    lastName: "Reddy"
  };
  // user = null;
  if (!user) {
    return res.send({
      error: "User Not Found"
    })

  }
  console.log(user, "users")
  return res.send(user)
  // const ssoResponse = loginDto.createSSORespSameAsDeep(req.userDetails, user);
  // const session = await sessionService
  // .createSession(user, null, false, req.deviceInfo, true, ssoResponse);
  // const token = cassandraUtil.generateTimeuuid();
  // await redisUtil.save(token, session.data, 60);
  // res.cookie('Authorization', session);
  // return res.redirect(302, `${process.env.DOMAIN_URL}/validate-sso-token?token=${token}`);
}

router.post('/login/sso/callback',
  userAgentHandler,
  passport
    .authenticate('saml', { failureRedirect: '/', failureFlash: true }), (req, res, next) => {
      // console.log(typeof (req.body.SAMLResponse), "res")
      const xmlResponse = req.body.SAMLResponse;
      console.log(xmlResponse, "xmlResponse")
      const parser = new Saml2js(xmlResponse);
      req.samlUserObject = parser.toObject();
      console.log(req.samlUserObject, "Parse")
      next();
    },
  (req, res) => createUserSession(req, res));


module.exports = router;

