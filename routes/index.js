var express = require('express');
var router = express.Router();
const { MongoClient } = require('mongodb');
const NodeGeocoder = require('node-geocoder');
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

const client = new MongoClient("mongodb://localhost:27017/shop2go", { useNewUrlParser: true, useUnifiedTopology: true });
function setToken(req, token) {
  req.session.csrfToken = token;
  req.session.save();
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/csrf', function (req, res, next) {
  const token = generateToken(req, true);
  return res.status(200).json({ token: token });
})

router.get('/test-db-connection', async (req, res) => {
  try {
    await client.connect();
    res.status(200).send('Connected to MongoDB');
  } catch (err) {
    res.status(500).send('Failed to connect to MongoDB');
  } finally {
    await client.close();
  }
});

router.get('/generate-csrf-token', (req, res) => {
  const token = generateToken(req, true);
  if (token) {
    res.status(200).send(token);
  } else {
    res.status(500).send('Failed to generate CSRF token');
  }
});


module.exports = router;