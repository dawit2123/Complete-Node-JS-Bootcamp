const AppError = require('./../utils/appError');
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const message = `Duplicate field value :${value}. Please use another value`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid data input. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTError = () => {
  return new AppError('Invalid token. Please login again', 401);
};
const handleJWTExpiredError = () => {
  return new AppError('Token expired. Please login again', 401);
};
const sendErrorDev = (err, res) => {
  res.json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack
  });
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.log('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong'
    });
  }
};
module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    //error handler for the cast errors like unable to cast id's to the mongoDB id
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    //error handler for the duplicate field errors
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    sendErrorProd(error, res);
  }
  if (error.name === 'JsonWebTokenError') handleJWTError();
  if (error.name === 'TokenExpiredError') handleJWTExpiredError();
};
