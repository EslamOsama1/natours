const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const Tour = require('./../models/tourModels');
// const APIFeature = require('./../utils/apiFeature')
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');





// File Upload --------------------------------------------------
const multerStorage = multer.memoryStorage();// store the image temprory in the RAM after edditing it (req.file.buffer)

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new AppError('Not an image! please upload only images', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

// upload.single('image') single image in a spacifice filed  ==> req.file
// upload.array('image' , 5) multiple images in the same filed  ==> req.files
//this for multiple images with differant fileds ==> req.files
exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
])

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    console.log(req.files);

    if (!req.files.imageCover || !req.files.images) return next(); // dont do nathinge

    //1) Cover Image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`

    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`)


    // 2) Images
    req.body.images = [];

    await Promise.all(req.files.images.map(async (file, i) => {

        const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`

        await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${fileName}`);

        req.body.images.push(fileName)
    })
    );


    next()
})
//---------------------------------------------------------------------------------

exports.aliasTopTour = async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next()
}


exports.getAlltours = factory.getAll(Tour)
exports.getTourByid = factory.getOne(Tour, { path: 'reviews' })
exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour);


// aggregation pipline syntax
// Model.aggregate([
//     {
//         $stage: {
//             field: value,
//             field2: {
//                 $operator: "$anotherField"
//             }
//         }
//     }
// ])


exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([// now we able to implement chaneges in the documentation statage by statage
        {// this called statage
            $match: { retingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: '$difficulty',
                // _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$retingsQantity' },
                avgRating: { $avg: '$retingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        },
        {
            $match: { _id: { $ne: 'EASY' } }
        }
    ])

    res.status(200).json({
        status: "success",
        data: {
            stats
        }
    })
})


exports.getMonthlyPlan = catchAsync(async (req, res, next) => {

    let year = req.params.year * 1
    let plan = await Tour.aggregate([
        {
            $unwind: '$startDates' //It convert every element inside the array into a separate document that can be worked with in the next aggregation stages.
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStart: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStart: -1 }
        },
        {
            $limit: 12
        }
    ])

    res.status(200).json({
        status: "success",
        data: {
            plan
        }
    })
})


// /tours-within/233/center/34.11124,-112.32114/unit/mi
// /tours-within/:distance/center/:latLng/unit/:unit
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;

    const [lat, lang] = latlng.split(',');

    const redius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lang) {
        next(new AppError('please provied latitutr and alngitude in the format lat,lang', 400))//Bad request
    }

    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [[lang, lat], redius]
            }
        }
    })

    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
            data: tours
        }
    })
})

exports.getDistances = catchAsync(async (req, res, next) => {

    const { latlng, unit } = req.params;
    const [lat, lang] = latlng.split(',');


    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lang) {
        next(new AppError('please provied latitutr and alngitude in the format lat,lang', 400))//Bad request
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lang * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])

    res.status(200).json({
        status: "success",
        data: {
            data: distances
        }
    })
})
