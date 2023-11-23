const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const { globalErrorHandler } = require('./handlers/errorHandlers');

const app = express();

if (process.env.NODE_ENV === 'develop') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  // console.log(req.headers);

  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', function(req, res, next) {
  // res.status(404).json({
  //   status: 'error',
  //   message: 'Route not found'
  // });
  // const error = new Error('Route not found');
  // error.status = 'fail';
  // error.statusCode = 404;

  next(new AppError('Route not found', 404));
});

app.use(globalErrorHandler);
// app.use((error, req, res, next) => {
//   error.statusCode = error.statusCode || 500;
//   error.status = error.status || 'Error';
//
//   res.status(error.statusCode).json({
//     status: error.status,
//     message: error.message
//   });
// });

module.exports = app;