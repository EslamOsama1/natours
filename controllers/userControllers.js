const express = require('express')
const sharp = require('sharp')
const multer = require('multer')// Handles file uploads in Express.
const User = require('./../models/userModels');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError')
const factory = require('./handlerFactory');

//req.file
// {
//   fieldname: 'photo',
//   originalname: '123028059_970548350119086_4224530188985402318_n.jpg',
//   encoding: '7bit',
//   mimetype: 'image/jpeg',
//   path: 'public\\img\\users\\689ecbe9f32039f77bdd6276548427e9',
//   destination: 'public/img/users',
//   filename: '689ecbe9f32039f77bdd6276548427e9',
//   size: 3043
// }

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

exports.uploadUserPhoto = upload.single('photo')// we pass here the name of the field

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next(); // dont do nathinge

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
    // image proccessing
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`)

    next()
})

//-----------------------------
const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj;
}

exports.getAllUsers = factory.getAll(User)

exports.updateMe = catchAsync(async (req, res, next) => {


    // 1) create error if user post password data
    if (req.body.password || req.body.passwordConfirm) return next(new AppError("this route is not for password update.", 400))//Bad request


    // 2)filterd out the unwanted feilds
    const filterBody = filterObj(req.body, 'name', 'email')

    if (req.file) filterBody.photo = req.file.filename;

    // 3) update the user Document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, { new: true, runValidators: true });

    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    })
})

exports.getMe = catchAsync(async (req, res, next) => {
    req.params.id = req.user.id
    next()
})

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({ //deleted
        status: "success",
        data: null
    })
})

exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User)
exports.updateUser = factory.updateOne(User)