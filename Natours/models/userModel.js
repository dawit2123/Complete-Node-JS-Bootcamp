const mongoose = require('mongoose');
const { string } = require('sharp/lib/is');
const validator = require('validator');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [10, 'A Name should have at least 10 characters long'],
    maxLength: [10, 'A Name should have at most 40 characters long'],
    required: [true, 'Please enter the name']
  },
  email: {
    type: String,
    validate: [validator.isEmail, 'Please enter a valid email'],
    requried: [true, 'please enter the email'],
    lowercase: true,
    unique: true
  },
  photo: string,
  password: {
    type: String,
    minLength: [8, 'A password should have at least 10 characters long'],
    required: [true, 'please enter the password']
  },
  passwordConfirm: {
    type: String,
    minLength: [
      8,
      'A password confirm should have at least 10 characters long'
    ],
    required: [true, 'please confirm the password'],
    validate: {
      validator: function() {
        return this.password === this.passwordConfirm;
      },
      message: "The password and password confirm doesn't match"
    }
  }
});
const User = mongoose.model('User', userSchema);
module.exports = User;
