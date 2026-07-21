const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

let bookingRouter = express.Router()

bookingRouter.use(authController.protect)

bookingRouter.get('/checkout-session/:tourID', bookingController.getCheckoutSession)



bookingRouter.get(
    '/create-booking-checkout',
    bookingController.createBookingCheckout
);

bookingRouter.use(authController.restrictTo('admin', 'lead-guid'))

bookingRouter.route('/')
    .get(bookingController.getAllBookings)


bookingRouter.route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking)

module.exports = bookingRouter