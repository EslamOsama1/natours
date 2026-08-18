const AppError = require("../utils/appError")

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path} : ${err.value}`; //        "value": "wwwwwwwwww","path": "_id"

    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const message = `duplicate field value: ${err.keyValue.name} , please use another value`;//        "code": 11000,

    return new AppError(message, 400);
}

const handleValidatorErrorDB = err => {
    const errors = Object.values(err.errors).map(ele => ele.message);
    const message = `Invalid input data ${errors.join('. ')}`;

    return new AppError(message, 400)
}

const handleJWTEror = () => new AppError('Invaild Token, please login again', 401);

const handleJWTExpiredEror = () => new AppError('Your Token has Expired! please log in again.', 401);


const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const sendErrorPro = (err, res) => {
    //operational , trusted error : send message to clint ,All the error comes from clsss appError is Operational 
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
        // programming or other unkowen error:don't leak error details
    } else {
        // console.log('ERROR', err);

        res.status(500).json({
            status: 'error',
            message: 'something went very wronge'
        })
    }
}

module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res)
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };

        if (error.name === 'CastError') {
            error = handleCastErrorDB(error) // with will happen only in production moode
        }

        if (error.code === 11000) {
            error = handleDuplicateFieldsDB(error)
        }

        if (error.name === 'ValidationError') {
            error = handleValidatorErrorDB(error)
        }

        if (error.name === 'JsonWebTokenError') {
            error = handleJWTEror(error)
        }

        if (error.name === 'TokenExpiredError') {
            error = handleJWTExpiredEror(error)
        }

        sendErrorPro(error, res)
    }
}