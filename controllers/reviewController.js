const express = require('express');
// const catchAsync = require('../utils/catchAsync')
const Review = require('./../models/reviewModels')
const factory = require('./handlerFactory');

exports.getAllRevies = factory.getAll(Review);
// exports.getAllRevies = catchAsync(async (req, res, next) => {
//     let filter = {}
//     if (req.params.tourId) filter = { tour: req.params.tourId }
//     const reviews = await Review.find(filter)

//     res.status(200).json({
//         status: 'success',
//         result: reviews.length,
//         data: {
//             reviews
//         }
//     })
// })

exports.setTourUserIds = (req, res, next) => {
    //Allow nested route
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next()
}

exports.createReview = factory.createOne(Review)

// exports.createReview = catchAsync(async (req, res, next) => {
//     if (!req.body.tour) req.body.tour = req.params.tourId;
//     if (!req.body.user) req.body.user = req.user.id;

//     const newreview = await Review.create(req.body);

//     res.status(201).json({
//         status: 'success',
//         data: {
//             review: newreview
//         }
//     })
// })

exports.deleteReview = factory.deleteOne(Review);
exports.updataReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review)