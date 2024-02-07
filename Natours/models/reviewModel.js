const mongoose = require('mongoose');
const Tour = require('./../models/tourModels');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please write a review']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 1
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
//calculating the average ratings using a static method
reviewSchema.statics.calcAverageRating = async function(tourId) {
  //In static functions, this keyword points to the model
  const stat = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        rAverage: { $avg: '$rating' }
      }
    }
  ]);
  const data = await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stat[0].rAverage,
    ratingsQuantity: stat[0].nRating
  });
};
//calling the calcAverageRating function on the save
reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.tour);
});

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'tour',
    select: 'name'
  }).populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
