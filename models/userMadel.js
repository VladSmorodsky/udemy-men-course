const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'The name value is required']
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email is not valid']
  },
  photo: String,
  passwordChangedAt: Date,
  password: {
    type: String,
    required: [true, 'The password is required'],
    minLength: 8,
    select: false
  },
  passwordConfirmation: {
    type: String,
    required: [true, 'Please confirm the password'],
    validate: {
      validator: function(value) {
        return value === this.password;
      },
      message: 'Passwords are not the same'
    }
  },
  role: {
    type: String,
    enum: ['admin', 'guide', 'lead-guide', 'user'],
    default: 'user'
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  resetToken: String,
  resetTokenExpires: Date
});

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') && this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  console.log(this);

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirmation = undefined;
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPassword = async function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedPasswordTime = this.passwordChangedAt.getTime() / 1000;

    return changedPasswordTime > JWTTimestamp;
  }

  console.log('test');

  return false;
};

userSchema.methods.createResetPasswordToken = async function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  console.log({ resetToken }, this.resetToken);
  this.resetTokenExpires = Date.now() + 10 * 60 * 1000;


  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;