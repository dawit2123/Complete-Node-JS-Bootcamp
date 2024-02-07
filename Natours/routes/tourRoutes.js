const express = require('express');
const {
  addTour,
  configTop5,
  deleteTour,
  getAllTours,
  getTour,
  getToursWithin,
  getTourStat,
  getDistances,
  monthlyPlan,
  updateTour
} = require('./../controllers/tourController');
const reviewRouter = require('./../routes/reviewRoutes');
const authController = require('./../controllers/authController');
const { route } = require('../app');

const router = new express.Router();
// router.param('id', checkID);

//doing nested routes for the review router
router.use('/:tourId/reviews', reviewRouter);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    monthlyPlan
  );
router.route('/get-tours-stat').get(getTourStat);
router.route('/top-5-best').get(configTop5, getAllTours);
router
  .route('/')
  .get(getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('user', 'lead-guide'),
    addTour
  );
router
  .route('/:id')
  .get(getTour)
  .patch(
    authController.protect,
    authController.restrictTo('user', 'lead-guide'),
    updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('user', 'lead-guide'),
    deleteTour
  );

module.exports = router;
