const path = require('path');
const express = require('express');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const errorController = require('./controllers/errorController');
const viewRouter = require('./routes/viewRoutes');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { title } = require('process');
const app = express();
//Global middleware for setting http headers.
app.use(helmet());
//use the compression package in order to compress the texts that are going to sent to the client
app.use(compression());
//telling the express to use pug as a view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//serving the static files
app.use(express.static(path.join(__dirname, 'public')));
//a middlware for setting a limit for the request from a specific ip
const limiter = {
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests. Please try again in one hour.'
};
const loginLimiter = {
  max: 3,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests. Please try again in one hour.'
};
app.use('/api', rateLimit(limiter));
app.use('/api/v1/users/login', rateLimit(loginLimiter));
app.use(cors());
app.options('*', cors());
// app.options('/api/v1/tours/', cors());
//Adding a middleware to the body object
app.use(express.json({ limit: '10kb' }));
//use the cookie parser in order to read cookie values
app.use(cookieParser());

//defend against the NoSQL attack
app.use(mongoSanitize());
//defend against the xss attack
app.use(xss());
//defend against the parameter pollution attacks
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);
//Adding the tourRouter and userRouter middleware
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/', viewRouter);
//A handler for the pages that are found in the routes
app.all('*', (req, res, next) => {
  //   const err = new Error();
  //   err.status = 'fail';
  //   err.statusCode = `404 can not get the request ${req.url}`;
  next(new AppError(`404 can not get the request ${req.url}`, 404));
});

//A global error handler middleware
app.use(errorController);
module.exports = app;
