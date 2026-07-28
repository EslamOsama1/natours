const path = require('path');
const express = require('express');
const morgan = require('morgan');//HTTP Request Logger Middleware(third party middleware)
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cors = require('cors')

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./Routes/tours-Route')
const userRouter = require('./Routes/users-Route')
const reviewsRouter = require('./Routes/reviews-Route')
const bookingRouter = require('./Routes/booking-Route')

// Start Express App
const app = express();


//Serving static fiels
// app.use(express.static('./starter/public'))
app.use(express.static(path.join(__dirname, 'public')))

// 1)GLOBAIL MIDDLEWARES
// implement CORS
app.use(cors()) // work only in simple request (get , post)

app.options('*', cors())
// app.options('/api/tours/:id' , cors())


//Set Security HTTP headers
app.use(helmet())

//Development loogging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))// record all the requests that came into the server and return info about them 
}

//Limit request from same IP
const limiter = rateLimit({
    max: 100, // number of request
    window: 60 * 60 * 1000, // How many hours
    message: ' To many request from this IP, please try again in an hour'
})
app.use('/api', limiter)


//body parser , reading data from body into req.body
app.use(express.json({ limit: '10kb' }));// limit the size of incoming data 

//Data sanitization aganist NOSQL query injection
app.use(mongoSanitize());// prevent this type of attacks {"$gt" : ""}

//Data sanitization aganist XSS
app.use(xss());

//prevent parameter pollution
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}))// api/v1/tours?sort=duration&sort=price



//create our own middleware
// app.use((req, res, next) => { // that will be ably to every sengle request because we didnt spacify a rout   
//     console.log("hello from the middleware");
//     next()
// })
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next()
})
//----------------------------------------------------------------------------------------


app.use('/api/v1/tours', tourRouter); //middleware

app.use('/api/v1/users', userRouter);

app.use('/api/v1/reviews', reviewsRouter);

app.use('/api/v1/bookings', bookingRouter);


app.all('*', (req, res, next) => { // this middleware will execut when user enter a undefiend url or parameter
    next(new AppError(`can't find ${req.originalUrl} on this server!`, 404)); // in this way we points to every middleware has (err, req, res, next)
})


//Global Error Handling Middleware
app.use(globalErrorHandler)


//EXPORT THE APP TO THE SERVER -----------------------------------------------------------

module.exports = app;