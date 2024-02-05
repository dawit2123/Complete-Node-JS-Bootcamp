const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const JWT = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const { use } = require('../app');
const signJWT = id => {
  return JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
module.exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });
  const token = signJWT(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});
module.exports.login = catchAsync(async function(req, res, next) {
  const { email, password } = req.body;
  //1) checking if there is an email and password
  if (!email || !password) {
    return next(new AppError('Please enter the email and password', 400));
  }
  //2) checkin if the user exist and the password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.isCorrectPassword(password, user.password)) {
    return next(new AppError('Incorrect email or password', 401));
  }
  //3) signing and sending the token
  const token = signJWT(user._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});
