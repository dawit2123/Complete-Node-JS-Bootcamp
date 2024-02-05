const mongoose = require('mongoose');
const { string } = require('sharp/lib/is');
const validator = require('validator');
const bcrypt = require('bcryptjs');
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
    required: [true, 'please enter the password'],
    select: false
  },
  passwordConfirm: {
    type: String,
    minLength: [
      8,
      'A password confirm should have at least 10 characters long'
    ],
    required: [true, 'please confirm the password'],
    validate: {
      validator: function(el) {
        return this.password === el;
      },
      message: "The password and password confirm doesn't match"
    }
  }
});
//preSave hook (handler) for the userSchema
userSchema.pre('save', async function(next) {
  //checking if the password isn't modified
  if (!this.isModified('password')) next();
  this.password = await bcrypt.hash(this.password, 12);
  //deleting the password confirm field
  this.passwordConfirm = undefined;
  next();
});
//not allowing the user to see the hashed password in creation
userSchema.post('save', function(doc, next) {
  this.password = undefined;
  next();
});
//creating isCorrectPassword instance method on the schema
userSchema.methods.isCorrectPassword = async (
  candidatePassword,
  userPassword
) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};
const User = mongoose.model('User', userSchema);
module.exports = User;
