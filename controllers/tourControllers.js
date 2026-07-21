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
// exports.checkID = (req, res, next, val) => { // it is a fucking middleware to check id insted of check the id in every function
//     console.log(`tour id is ${val}`);

//     if (req.params.id * 1 > tours.length) {
//         return res.status(404).json({
//             status: "faild",
//             message: "Invalid ID"
//         })
//     }
//     next()
// };
// exports.checkBody = (req, res, next) => {//middleware
//     if (!req.body.name && !req.body.price) {
//         return res.status(400).json({
//             status: "faild",
//             message: "Missing name and price"
//         })
//     } else if (!req.body.name) {
//         return res.status(400).json({
//             status: "faild",
//             message: "Missing name header"
//         })
//     } else if (!req.body.price) {
//         return res.status(400).json({
//             status: "faild",
//             message: "Missing price header"
//         })
//     }
//     next()
// }


exports.aliasTopTour = async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next()
}


// exports.getAlltours = catchAsync(async (req, res, next) => {

//     // console.log(req.query);
//     // return all document in the database

//     // const allTours = await Tour.find() 

//     // 1A) FILTERING
//     // const allTours = await Tour.find().where('difficulty').equals('easy').where('duration').equals(5) // the hard coded way
//     // let queryObj = { ...req.query };
//     // const excludeFields = ['page', 'limit', 'sort', 'fields']
//     // excludeFields.forEach(e => delete queryObj[e])
//     //1B) ADVANCED FILTERING
//     //{ 'difficulty' : easy , 'duration' : {$gte : 5 }} that how we write greater than or equal in mongo
//     // $gte , $gt , $lte , $lt we must write the query like that in mongo but the query return like that {duration: { gte: '5' }} 
//     //but we want to make it like this {duration: {$gte: '5'}} so we impelement a regix on it 
//     //http://127.0.0.1:8000/api/v1/tours?duration[gte]=5&difficulty=easy&sort=A-Z&limit=5&price[lt]=1000
//     // let queryStr = JSON.stringify(queryObj);
//     // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
//     // // console.log(JSON.parse(queryStr));
//     // let query = Tour.find(JSON.parse(queryStr));


//     //2) SORTING
//     // if (req.query.sort) {
//     //     const sortBy = req.query.sort.split(',').join(' '); // to be like that sort('price ratingsAvarage') and that how sort() work
//     //     query = query.sort(sortBy)
//     // } else {//http://127.0.0.1:8000/api/v1/tours?sort=-price,-ratingsAverage
//     //     query = query.sort('-createdAt') // the default value
//     // }

//     //3) FIELDS LIMITING
//     // if (req.query.fields) {
//     //     const fields = req.query.fields.split(',').join(' ')
//     //     // console.log(fields)
//     //     query = query.select(fields)
//     // } else {//http://127.0.0.1:8000/api/v1/tours?fields=name,duration,difficulty,price
//     //     query = query.select('-__v'); // in this way i prevent these header from sending to the clint 
//     // }


//     //4) PAGINATION
//     //page=2&limit=10  page 1 = 1->10 , page 2 = 11->20 , ...
//     // const page = req.query.page * 1 || 1;
//     // const limit = req.query.limit * 1 || 100;
//     // const skip = (page - 1) * limit;

//     // query = query.skip(skip).limit(limit)//http://127.0.0.1:8000/api/v1/tours?page=1&limit=3

//     // if (req.query.page) {
//     //     const numTours = await Tour.countDocuments();
//     //     if (skip >= numTours) throw new Error('this page does not Exist')// that will trager the catch block
//     // }

//     // )EXCUTE QUERY
//     const features = new APIFeature(Tour.find(), req.query).filter().sort().limitFields().pagination()
//     const allTours = await features.query;
//     // query.sort().select().skip().limit()

//     // ) SEND RESPONSE
//     console.log(req.requestTime)
//     res.status(200).json({
//         status: "success",
//         request_time: req.requestTime,
//         result: allTours.length,
//         data: {
//             tours: allTours
//         }
//     })
// })

exports.getAlltours = factory.getAll(Tour)

// exports.getTourByid = (req, res) => {
// console.log(req.params);
// let id = req.params.id * 1; // it well convert string like "1" into number
// let tour = tours.find((e) => e.id === id)// return the first e match the condition
// res.status(200).json({
//     status: "success",
//     // data: {
//     //     tours: tour
//     // }
// })
// }

exports.getTourByid = factory.getOne(Tour, { path: 'reviews' })


// exports.createTour = async (req, res,next) => {
//     try {
//         const newTour = await Tour.create(req.body);
//         res.status(201).json({
//             status: "success",
//             data: {
//                 tours: newTour
//             }
//         })
//     } catch (err) {
//         res.status(400).json({
//             status: "Faild",
//             message: err
//         })
//     }

// }

exports.createTour = factory.createOne(Tour)



// exports.updateTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

//     if (!tour) {
//         return next(new AppError('No tour found with that ID', 404))
//     }

//     res.status(200).json({
//         status: "success",
//         data: {
//             tour
//         }
//     })
// })
exports.updateTour = factory.updateOne(Tour)

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
