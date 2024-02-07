const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./../controllers/handleFactory');

module.exports.setTourUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
module.exports.createReview = factory.createOne(Review);

module.exports.getReview = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.body.tourId };
  const data = await Review.find({ filter });
  res.status(200).json({
    status: 'success',
    results: data.length,
    data: {
      data
    }
  });
});

module.exports.deleteReview = factory.deleteOne(Review);
module.exports.updateReview = factory.updateOne(Review);
