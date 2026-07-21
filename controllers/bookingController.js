const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Tour = require('./../models/tourModels');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const { CurrencyCodes } = require('validator/lib/isISO4217');
const Booking = require('./../models/bookingModels')

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    //1)Get the currently booked tour
    const tour = await Tour.findById(req.params.tourID)

    //2)create checkout session
    // 

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',

        // success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,
        success_url: `${req.protocol}://${req.get('host')}/api/v1/bookings/create-booking-checkout?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,

        customer_email: req.user.email,
        client_reference_id: req.params.tourID,

        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [
                            `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`
                        ]
                    },
                    unit_amount: tour.price * 100
                },
                quantity: 1
            }
        ]
    });
    //3) send it to clint
    res.status(200).json({
        status: ' success',
        session
    })
})

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    //this is only temprory, because it's unsecure : everyone cane make booking without paying
    const { tour, user, price } = req.query

    if (!tour && !user && !price) return next();

    await Booking.create({ tour, user, price });

    // res.redirect(req.originalUrl.split('?')[0])
    res.status(201).json({
        status: 'success',
        message: 'Booking created'
    });
})

exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

