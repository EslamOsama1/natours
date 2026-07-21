const crypto = require('crypto')
const { promisify } = require('util');//It turns any function that relies on a callback into a function that returns a Promise.
const catchAsync = require('../utils/catchAsync')
const User = require('./../models/userModels')
const jwt = require('jsonwebtoken')
const AppError = require('./../utils/appError')
const Email = require('../utils/email');



const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, res) => {
    //create a token with signToken function
    const token = signToken(user._id);

    const expires = new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    );

    const cookieOption = {
        expires,
        httpOnly: true
    }
    // if we are in production mode use https
    if (process.env.NODE_ENV === 'production') cookieOption.secure = true // https
    res.cookie('jwt', token, cookieOption)

    //remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async (req, res, next) => {


    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role
    });

    const url = `${req.protocol}://${req.get('host')}/me`;

    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, res)

});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body; // the same as  (email = req.body.email ; password = req.body.password ) but this is the best using distructuring

    //1) Check if email and password is exist in req.body
    if (!email || !password) {
        return next(new AppError('please provide email and password!', 400))
    }
    //2) Check if user exist && password is correct
    const user = await User.findOne({ email }).select("+password") // this equal to => email : email => field : variable
    // const correct =await user.correctPassword(password , user.password)

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect Email or Password', 401))
    }
    //3) If everything ok , send token to client
    createSendToken(user, 200, res)

})

exports.protect = catchAsync(async (req, res, next) => {
    // 1) get the token and check if its exist
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]
    }
    if (!token) {
        return next(new AppError('you are not logged in! please log in to get access', 401))
    }
    //2) verification the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)//decoded = {id: "6a4668d854657d6d281a2e3e",iat: 1783000000,exp: 1790000000}

    //3) Check if user still exist
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(new AppError('the user belonging to this token is no longer exist.', 401))
    }
    //4) if user change password after the token was issused
    if (currentUser.changedPasswordAfter(decoded.iat))
        return next(new AppError('User recently change password! please log in again.', 401));


    //Grant Access to Protect Route
    req.user = currentUser;
    next()
})


exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles = ['admin' , 'lead-guide']
        if (!roles.includes(req.user.role)) { // role = ' user'
            return next(new AppError("you don't have the permission to perform this action.", 403))
        };//forbiden
        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1) get user based in posted email
    const user = await User.findOne({ email: req.body.email })
    if (!user) return next(new AppError("there is no user with email address.", 404))// not found

    //2) generate the random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //3) send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    // const message = `Forgot password?\nsubmit a PATCH request with your new password and passwordConfifm to: ${resetURL}. 
    // \nIf you didn't forget your password ignore this email`

    try {
        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    } catch (err) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({ validateBeforeSave: false });

        return next(new AppError("there was an error sending an email. try again later!", 500))
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1)get user based on the token
    const hasedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hasedToken,
        passwordResetExpires: { $gt: Date.now() }
    }) // field : value

    //2)if token is valid and user is exist , set the new password
    if (!user) return next(new AppError("Token is invalid or has expired.", 400))// Bad request

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm

    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined

    await user.save();
    //3)update the changePasswordAt proberty for the user 


    //4)log the user in,send JWT
    createSendToken(user, 200, res)

});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from the collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) check if posted current password is correct 
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError("Your current password is wrong.", 401))
    }
    // 3) if the password is correct , update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) log the user in , send JWT 
    createSendToken(user, 201, res)

})


