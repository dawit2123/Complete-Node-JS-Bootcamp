const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { type } = require('os');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name']
  },
  email: {
    type: String,
    required: [true, 'Please provide us your email address'],
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email address'],
    lowercase: true
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  password: {
    type: String,
    required: [true, 'A user should have a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A user should confirm a password'],
    validate: {
      //Custom validator function that works for only save and create functions
      validator: function(el) {
        return el === this.password;
      },
      messsage: 'Passwords do not match'
    }
  },
  passwordChangedAt: {
    type: Date
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: String,
    default: true,
    select: false
  }
});
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 2000;
  next();
});
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});
//check password instance method that is available for all the documents
userSchema.methods.checkPassword = (candidatePassword, UserPassword) => {
  return bcrypt.compare(candidatePassword, UserPassword);
};
//generating the random token for the reset
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
// check if the timestamp of the jwt is greater than the timestamp of password changed at
userSchema.methods.passwordChangedAfter = function(
  passwordChanged,
  jwtTimestamp
) {
  if (passwordChanged) {
    if (parseInt(passwordChanged.getTime() / 1000) > jwtTimestamp) {
      return true;
    }
  }
  return false;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
