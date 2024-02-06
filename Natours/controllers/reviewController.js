const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
module.exports.createReview = catchAsync(async (req, res, next) => {
  const data = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    tour: req.body.tour,
    user: req.user._id
  });
  res.status(201).json({
    status: 'success',
    data: {
      data
    }
  });
});

module.exports.getReview = catchAsync(async (req, res, next) => {
  const data = await Review.find({});
  res.status(200).json({
    status: 'success',
    results: data.length,
    data: {
      data
    }
  });
});
