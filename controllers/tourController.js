const Tour = require('../models/tourModel');
const ApiFeatures = require('./../utils/apiFeatures');
const { catchAsync } = require('../handlers/errorHandlers');
const AppError = require('../utils/appError');

exports.getTopFiveCheapestTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,difficulty,duration,summary,ratingsAverage';
  next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        tourNumber: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ]);

  res.status(200)
    .json({
      status: 'success',
      data: {
        stats
      }
    });
  // try {
  //   const stats = await Tour.aggregate([
  //     {
  //       $group: {
  //         _id: { $toUpper: '$difficulty' },
  //         tourNumber: { $sum: 1 },
  //         avgPrice: { $avg: '$price' },
  //         minPrice: { $min: '$price' },
  //         maxPrice: { $max: '$price' }
  //       }
  //     }
  //   ]);
  //
  //   res.status(200)
  //     .json({
  //       status: 'success',
  //       data: {
  //         stats
  //       }
  //     });
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'error',
  //     message: error.message
  //   });
  // }
});

exports.getTours = catchAsync(async (req, res, next) => {
  const toursRequest = new ApiFeatures(Tour.find(), req.query)
    .filter()
    .limitFields()
    .sort()
    .paginate();

  const tours = await toursRequest.query;

  res.status(200)
    .json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  // try {
  //   const toursRequest = new ApiFeatures(Tour.find(), req.query)
  //     .filter()
  //     .limitFields()
  //     .sort()
  //     .paginate();
  //
  //   const tours = await toursRequest.query;
  //
  //   res.status(200)
  //     .json({
  //       status: 'success',
  //       results: tours.length,
  //       data: {
  //         tours
  //       }
  //     });
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'error',
  //     message: error.message
  //   });
  // }
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: tour
    }
  });
  // try {
  //   const tour = await Tour.findById(req.params.id);
  //
  //   res.status(200).json({
  //     status: 'success',
  //     data: {
  //       tour: tour
  //     }
  //   });
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'error',
  //     message: 'Tour not found' //TODO add appropriate error handler
  //   });
  // }
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
  // try {
  //   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
  //     new: true,
  //     runValidators: true
  //   });
  //
  //   res.status(200).json({
  //     status: 'success',
  //     data: {
  //       tour
  //     }
  //   });
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'error',
  //     message: error //TODO add appropriate error handler
  //   });
  // }
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
  // try {
  //   await Tour.findByIdAndDelete(req.params.id);
  //
  //   res.status(204).json({
  //     status: 'success',
  //     data: null
  //   });
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'error',
  //     message: error //TODO add appropriate error handler
  //   });
  // }
});

exports.getPlanByMonth = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        toursCount: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: {
        month: '$_id'
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: {
        toursCount: -1
      }
    }
  ]);

  res.status(200)
    .json({
      status: 'success',
      data: {
        plan
      }
    });
  // try {
  //   const year = req.params.year * 1;
  //   const plan = await Tour.aggregate([
  //     {
  //       $unwind: '$startDates'
  //     },
  //     {
  //       $match: {
  //         startDates: {
  //           $gte: new Date(`${year}-01-01`),
  //           $lte: new Date(`${year}-12-31`)
  //         }
  //       }
  //     },
  //     {
  //       $group: {
  //         _id: { $month: '$startDates' },
  //         toursCount: { $sum: 1 },
  //         tours: { $push: '$name' }
  //       }
  //     },
  //     {
  //       $addFields: {
  //         month: '$_id'
  //       }
  //     },
  //     {
  //       $project: {
  //         _id: 0
  //       }
  //     },
  //     {
  //       $sort: {
  //         toursCount: -1
  //       }
  //     }
  //   ]);
  //
  //   res.status(200)
  //     .json({
  //       status: 'success',
  //       data: {
  //         plan
  //       }
  //     });
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'error',
  //     message: error.message
  //   });
  // }
});