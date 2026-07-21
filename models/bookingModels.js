const Mongoose = require('mongoose')

const bookingSchema = new Mongoose.Schema({
    tour: {
        type: Mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'booking must have Tour!']
    },
    user: {
        type: Mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'booking must have User!']
    },
    price: {
        type: Number,
        required: [true, 'booking must have pirce']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
})

bookingSchema.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    })
    next()
})

const Booking = Mongoose.model('Booking', bookingSchema)

module.exports = Booking