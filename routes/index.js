var express = require('express');
var router = express.Router();
const { csrfSync } = require("csrf-sync");
const {
  invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware.
  generateToken, // Use this in your routes to generate, store, and get a CSRF token.
  getTokenFromRequest, // use this to retrieve the token submitted by a user
  getTokenFromState, // The default method for retrieving a token from state.
  storeTokenInState, // The default method for storing a token in state.
  revokeToken, // Revokes/deletes a token by calling storeTokenInState(undefined)
  csrfSynchronisedProtection, // This is the default CSRF protection middleware.
} = csrfSync();

function setToken(req, token) {
  req.session.csrfToken = token;
  req.session.save();
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/getcsrftoken', function (req, res, next) {
  const token = generateToken(req, true);
  //setToken(req, token);
  return res.status(200).json({ token: token });
})


module.exports = router;
