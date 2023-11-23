const AppError = require('../utils/appError');

const sendErrorProduction = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err
    });
  } else {
    console.error(err);
    res.status(500).json({
      status: err.status,
      message: 'Something went wrong'
    });
  }
};

const handleCastError = err => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};

const handleDuplicateError = err => {
  const message = err.message;
  // const message = `Duplicate Error: field ${err.path} with value ${err.value} already exists`;


  return new AppError(message, 400);
};

exports.globalErrorHandler = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'develop') {
    console.log(error.name);
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      stack: error.stack,
      error: error
    });
  } else if (process.env.NODE_ENV === 'production') {
    let productionError = { ...error };
    console.log(productionError.name);

    if (productionError.name === 'CastError') {
      productionError = handleCastError(productionError);
    } else if (productionError.code === 11000) {
      productionError = handleDuplicateError(productionError);
    }

    // return _next(productionError);
    sendErrorProduction(productionError, res);
  }
};

exports.catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};