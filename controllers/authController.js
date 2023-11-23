const User = require('./../models/userMadel');
const jwt = require('jsonwebtoken');
const { catchAsync } = require('../handlers/errorHandlers');
const AppError = require('../utils/appError');
const { promisify } = require('util');
const { sendEmail } = require('../utils/email');
const crypto = require('crypto');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN
});

const createToken = (user, status, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN),
    secure: true,
    httpOnly: true
  });

  res.status(status).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });

  createToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please enter email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Email or password invalid'), 401);
  }

  createToken(user, 200, res);
  //
  // const token = signToken(user._id);
  //
  // res.status(200).json({
  //   status: 'success',
  //   token
  // });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Please login into system', 401));
  }

  let decodedToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  let currentUser = await User.findById(decodedToken.id);
  if (!currentUser) {
    return next(new AppError('Token is not valid. Please log in into system'), 401);
  }

  if (await currentUser.changedPassword(decodedToken.iat)) {
    return next(new AppError('Password was changed. Please login again', 401));
  }

  req.user = currentUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You can\'t remove tours', 403));
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return new AppError('User with email doesn`t exists', 404);
  }

  const resetToken = await user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Reset Password (Will expired after 10 mins)',
      message: `Please go to the link to set new password: ${resetUrl}`
    });

    res.status(200).json({
      status: 'success',
      message: 'EMail is sent'
    });
  } catch (error) {
    this.resetToken = undefined;
    this.resetTokenExpires = undefined;

    res.status(500).json({
      status: 'error',
      message: 'Smth wrong with sending email'
    });
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ resetToken: hashedToken, resetTokenExpires: { $gt: Date.now() } });

  if (!user) {
    return next(new AppError('Token is invalid or was expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirmation = req.body.passwordConfirm;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;

  await user.save();

  createToken(user, 200, res);
  // const token = signToken(user._id);
  //
  // res.status(200).json({
  //   status: 'success',
  //   token
  // });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new AppError('User not existed'), 400);
  }

  if (!await (user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Password is invalid', 400));
  }

  user.password = req.body.password;
  user.passwordConfirmation = req.body.passwordConfirmation;
  await user.save();

  createToken(user, 200, res);
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token
  // });
});