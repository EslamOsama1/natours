const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError');
const { Model } = require('mongoose');
const APIFeature = require('./../utils/apiFeature')


exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)
    if (!doc) {
        return next(new AppError('No document found with that ID', 404))
    }

    res.status(204).json({
        status: "success",
        data: null
    })
})

exports.updateOne = module => catchAsync(async (req, res, next) => {
    const doc = await module.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!doc) {
        return next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({
        status: "success",
        data: {
            data: doc
        }
    })
})

exports.createOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.create(req.body);
    res.status(201).json({
        status: "success",
        data: {
            data: doc
        }
    })
})

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    // const tour = await Tour.findById(req.params.id).populate('reviews')//this populate will add reviews header in the body

    if (!doc) {
        return next(new AppError('No document found with that ID', 404))
    }
    res.status(200).json({
        status: "success",
        data: {
            data: doc
        }
    })
}
)


exports.getAll = Model => catchAsync(async (req, res, next) => {
    //to allow for nested GET review if ite exist on tour 
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }


    const features = new APIFeature(Model.find(), req.query).filter().sort().limitFields().pagination()
    const doc = await features.query
    // .explain();


    // ) SEND RESPONSE
    console.log(req.requestTime)
    res.status(200).json({
        status: "success",
        request_time: req.requestTime,
        result: doc.length,
        data: {
            data: doc
        }
    })
})


//this is the referance
// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id)
//     console.log(tour)
//     if (!tour) {
//         return next(new AppError('No tour found with that ID', 404))
//     }

//     res.status(204).json({
//         status: "success",
//         data: null
//     })
// })
