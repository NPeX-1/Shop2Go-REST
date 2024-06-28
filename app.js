var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
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

var { expressjwt: jwt } = require("express-jwt");

var mongoose = require('mongoose');
var mongoDB = "mongodb://localhost:27017/shop2go";  // Primary MongoDB URI
var mongoDBFallback = "mongodb://mongo:27017/shop2go";  // Fallback MongoDB URI

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    console.log('Trying fallback MongoDB connection...');
    mongoose.connect(mongoDBFallback, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        console.log('Fallback MongoDB connected successfully');
      })
      .catch((err) => {
        console.error('Fallback MongoDB connection error:', err.message);
      });
  });

mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/UsersRoutes');
var offersRouter = require('./routes/OffersRoutes');
var logsRouter = require('./routes/LogsRoutes');
var contactRouter = require('./routes/ContactRoutes');
var notificationsRouter = require('./routes/NotificationsRoutes');

var app = express();


var cors = require('cors');
var allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://172.211.46.40:81', 'http://shop.npustudios.eu'];
app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = "The CORS policy does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var session = require('express-session');
var MongoStore = require('connect-mongo');
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: mongoDB })
}));

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

/*app.use(
  jwt({
    secret: "secretKey231342345t94809dscjnhiks",
    algorithms: ["HS256"],
  })
);*/


app.use('/', indexRouter);
app.use('/users', csrfSynchronisedProtection, usersRouter);
app.use('/offers', offersRouter);
app.use('/log', logsRouter);
app.use('/contact', contactRouter);
app.use('/notifications', notificationsRouter);


app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
