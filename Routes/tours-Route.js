const express = require('express')
// const fs = require('fs');
const tourController = require('../controllers/tourControllers');
const authController = require('../controllers/authController');
const reviesRouter = require('./reviews-Route');



let tourRouter = express.Router();

tourRouter.use('/:tourId/reviews', reviesRouter)

tourRouter.route('/top-5-cheap')
    .get(tourController.aliasTopTour, tourController.getAlltours)

tourRouter.route('/tour-stats').get(tourController.getTourStats)

tourRouter.route('/monthly-plan/:year').get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan)


tourRouter.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin)

tourRouter.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)

tourRouter.route("/")
    .get(tourController.getAlltours)
    .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour)

tourRouter.route("/:id")// we add (:) to assign a varaiable to a url and to make it optional we can give yo it (?) after the var name
    .get(tourController.getTourByid)
    .patch(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour
    )
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour)



module.exports = tourRouter; 