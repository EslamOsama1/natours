const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

let reviewsRouter = express.Router({ mergeParams: true })

reviewsRouter.use(authController.protect)

reviewsRouter.route('/')
    .get(reviewController.getAllRevies)
    .post(authController.restrictTo('user'), reviewController.setTourUserIds, reviewController.createReview)


reviewsRouter.route('/:id')
    .get(reviewController.getReview)
    .patch(authController.restrictTo('user', 'admin'), reviewController.updataReview)
    .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview)



module.exports = reviewsRouter