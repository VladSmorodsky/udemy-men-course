const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('../controllers/authController');
const router = express.Router();

// router.param('id',  tourController.checkTourId)

router.route('/top-five-cheapest-tours').get(tourController.getTopFiveCheapestTours, tourController.getTours);

router.route('/tours-stat').get(tourController.getTourStats);
router.route('/tours-plan/:year').get(tourController.getPlanByMonth);

router.route('/')
  .get(authController.protect, tourController.getTours)
  .post(tourController.createTour);

router.route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo(['admin', 'lead-guide']),
    tourController.deleteTour
  );

module.exports = router;