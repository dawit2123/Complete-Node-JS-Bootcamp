const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const JWT = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const { use } = require('../app');
const { promisify } = require('util');
const sendMail = require('./../utils/email');
const signJWT = id => {
  return JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
const createAndSignToken = (user, statusCode, res) => {
  const token = signJWT(user._id);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};
module.exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });
  createAndSignToken(newUser, 201, res);
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
  createAndSignToken(user, 201, res);
});
module.exports.protect = catchAsync(async (req, res, next) => {
  //1) checking if the token exists
  let token;
  if (req.headers && req.headers.authentication) {
    token = req.headers.authentication.split(' ')[1];
  }
  if (!token) {
    next(new AppError('Unable to authenticate'));
  }
  //2) verifying the token by promisifying it
  const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);
  //3) checking if the user exists
  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError('User no longer exist', 401));
  //4) checking if the user changed the password
  if (user.isPasswordChanged(decoded.iat))
    return next(new AppError('user has recently changed the password', 401));
  req.user = user;
  next();
});
module.exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    let isAuthorised = false;
    roles.forEach(role => {
      if (req.user.role === role) isAuthorised = true;
    });
    if (!isAuthorised)
      return next('You are not authorised to access this routed', 401);
    next();
  };
};
module.exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) getting the user based on the email address
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('There is no user with that email address.', 401));
  //2) creating a random token and saving it in the database
  const token = user.createToken();
  user.save({ validateBeforeSave: false });
  //3) send it via an email
  const resetLink = `${req.protocol}//${req.get(
    'host'
  )}/api/v1/users/resetPassword/${token}`;
  const text = `The password reset link is : \n ${resetLink}. 
  If you don't forgot the password, just ignore this email`;
  try {
    await sendMail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      text
    });
    res.status(200).json({
      status: 'success',
      message: 'Reset link successfully sent via email'
    });
  } catch (err) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError(`Couldn't send an email. Please try again`));
  }
});
module.exports.resetPassword = (req, res, next) => {
  //1) getting the user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  //2) checking if the token expires and setting the new password
  if (!user) {
    return next(
      new AppError('You have used invalid link to reset the password', 401)
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.save();
  //3) updating passwordChangedAt property
  //made by the pre save hook on the userSchema
  //4) signing and sending the token
  createAndSignToken(user, 201, res);
};
module.exports.updatePassword = catchAsync(async (req, res, next) => {
  //1)getting the current password , new password and confirm password values
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;
  const user = User.findById(user._id).select('+password');
  //2) checking whether the current password is the same as the user password in the db
  const verified = user.isCorrectPassword(currentPassword, user.password);
  if (!verified) {
    next('Your current password is wrong', 401);
  }
  //3) if so update the password by checking the password with the passwordConfirm
  user.password = newPassword;
  user.confirmPassword = confirmPassword;
  await user.save();
});
