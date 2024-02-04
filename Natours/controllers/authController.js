const catchASync = require('./../utils/catchAsync');
const User = require('./../models/userModel');

module.exports.signup = catchASync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.password,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
});
