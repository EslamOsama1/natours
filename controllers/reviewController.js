const express = require('express');
const Review = require('./../models/reviewModels')
const factory = require('./handlerFactory');

exports.getAllRevies = factory.getAll(Review);
exports.setTourUserIds = (req, res, next) => {
    //Allow nested route
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next()
}

exports.createReview = factory.createOne(Review)
exports.deleteReview = factory.deleteOne(Review);
exports.updataReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review)