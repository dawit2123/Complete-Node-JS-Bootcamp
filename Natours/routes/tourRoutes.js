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
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');
const { route } = require('../app');

const router = new express.Router();
//for the route /tourId i can assign another middleware inside a middleware
router.use('/:tourId/reviews', reviewRouter);
// router.param('id', checkID);
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
    authController.restrictTo('admin', 'lead-guide'),
    addTour
  );
router
  .route('/:id')
  .get(getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'leade-guide'),
    deleteTour
  );
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(getDistances);
module.exports = router;
