const express = require('express')
// const fs = require('fs');
const tourController = require('../controllers/tourControllers');
const authController = require('../controllers/authController');
const reviesRouter = require('./reviews-Route');



let tourRouter = express.Router();


//Nested Route
// POST /tour/23df7df98/reviews
// tourRouter.route('/:tourId/reviews')
//     .post(authController.protect, authController.restrictTo('user'), reviewController.createReview) 
// this the right way to do nested route , her we can create review on a spasifice Tour
tourRouter.use('/:tourId/reviews', reviesRouter)



// tourRouter.param('id', tourController.checkID);

//create a checkBody middlewar
//check the body contains the name and price property
// if not , send back 400 (bad request)
// add it to post handler req

tourRouter.route('/top-5-cheap')
    .get(tourController.aliasTopTour, tourController.getAlltours)

tourRouter.route('/tour-stats').get(tourController.getTourStats)

tourRouter.route('/monthly-plan/:year').get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan)


tourRouter.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin)
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

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