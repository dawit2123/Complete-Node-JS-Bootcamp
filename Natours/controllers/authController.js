const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const { promisify } = require('util');
const sendMail = require('./../utils/email');
const crypto = require('crypto');
const { use } = require('../app');

const signToken = _id => {
  return jwt.sign({ id: _id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.TOKEN_EXPIRATION_INTERVAL
  });
};
const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expiresIn: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRATION_INTERVAL * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  user.password = undefined;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    data: user,
    token
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });
  //Sending a web token
  createAndSendToken(newUser, 201, res);
});
exports.login = catchAsync(async (req, res, next) => {
  //Checking if the email and password is sent to the server
  if (!(req.body.email && req.body.password)) {
    return next(new AppError('Email and password is required to login', 400));
  }
  //Checking if the email and password match
  const user = await User.findOne({ email: req.body.email }).select(
    '+password'
  );
  if (!user || !(await user.checkPassword(req.body.password, user.password))) {
    return next(new AppError('Email or password is incorrect', 401));
  }
  createAndSendToken(user, 200, res);
});
exports.protect = catchAsync(async (req, res, next) => {
  //Checking whether the token is sent or not
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    next(new AppError("You're not logged in. Please login to gain access."));
  }
  //Verification token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );
  //checking whether the user holding the token is deleted
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user holding the token no longer exist.', 401)
    );
  }
  //checking whether the user has changed the password after the token is issued
  if (
    currentUser.passwordChangedAfter(currentUser.passwordChangedAt, decoded.iat)
  ) {
    return next(new AppError('Password is changed. Please login in again.'));
  }
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});
exports.logout = async (req, res) => {
  res.cookie('jwt', 'loggedout', {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 1000)
  });
  res.status(200).json({
    status: 'success'
  });
};
exports.isLoggedIn = async (req, res, next) => {
  try {
    //Checking whether the token is sent or not
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
      //Verification token
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET_KEY
      );
      //checking whether the user holding the token is deleted
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      //checking whether the user has changed the password after the token is issued
      if (
        currentUser.passwordChangedAfter(
          currentUser.passwordChangedAt,
          decoded.iat
        )
      ) {
        return next();
      }
      res.locals.user = currentUser;
      return next();
    }
    next();
  } catch (err) {
    next();
  }
};
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(new AppError('You are not allowed to delete', 403));
    }
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1)get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user found by that email', 404));
  }
  //2)generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3)send it to the user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password ? Submit a PATCH request with your new password and passwordConfirm to :${resetURL}.\n 
  If you didn't forget your password, please ignore this email.`;
  try {
    await sendMail({
      email: user.email,
      subject: 'Your password reset token valid for 10 min',
      message
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to meail'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
  }
  await user.save({ validateBeforeSave: false });
});
exports.resetPassword = (req, res, next) => {
  //1) checking the user based on the token and checking whether its password is expired
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = User.findOne({
    passwordResetToken: hashedToken,
    passwordResetToken: { $gt: Date.now() }
  });
  if (!user) return next('Invalid token used. Please try again.');
  //2) Setting the new password
  const newPassword = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  user.password = newPassword;
  user.passwordConfirm = confirmPassword;
  user.save();
  //3) Setting the changedPasswordAt propery by the document middlware dynamically
  //4) login the user using the JWT
  createAndSendToken(user, 200, res);
};
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) get the user from the collection
  const user = await User.findById(req.user._id).select('+password');
  //2) checking if the posted current password is the same as the password
  if (!(await user.checkPassword(req.body.passwordCurrent, user.password))) {
    next('The current password is wrong.');
  }
  //3) if so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //4) login the user using JWT token
  createAndSendToken(user, 200, res);
});
