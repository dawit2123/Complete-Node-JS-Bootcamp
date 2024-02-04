const Tour = require('./../models/tourModels');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./../controllers/handleFactory');
exports.configTop5 = async (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.addTour = factory.createOne(Tour);
//Utilisation of the aggregate function of MongoDB driver
exports.getTourStat = catchAsync(async (req, res, next) => {
  const stat = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        // _id: null,
        numOfTour: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        numRating: { $avg: '$ratingsQuantity' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgPrice: { $avg: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);
  res.json({
    status: 'success',
    data: {
      stat
    }
  });
});
exports.monthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gt: new Date(`${year}-01-01`),
          $lt: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: {
        month: '$id'
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: {
        numTourStarts: -1
      }
    },
    {
      $limit: 12
    }
  ]);
  res.json({
    status: 'success',
    data: {
      plan
    }
  });
});
//tours-within/233/center/34.11,-118.11/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  let radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide the latitude and logitude in the format lat,lng',
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });
  res.status(200).json({
    status: 'success',
    data: {
      data: tours
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide the latitude and logitude in the format lat,lng',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});
