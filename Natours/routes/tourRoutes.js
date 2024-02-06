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
router.route('/monthly-plan/:year').get(monthlyPlan);
router.route('/get-tours-stat').get(getTourStat);
router.route('/top-5-best').get(configTop5, getAllTours);
router
  .route('/')
  .get(getAllTours)
  .post(addTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

module.exports = router;
