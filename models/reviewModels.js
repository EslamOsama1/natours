const Mongoose = require('mongoose')
const Tour = require('./tourModels');


const reviewSchema = new Mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false // in this way i prevent these header from sending to the clint 
    },
    tour: {
        type: Mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, ' review must belonge to a tour!']
    },
    user: {
        type: Mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, ' review must belonge to a USER!']
    }

},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)
//prevent duplicate reviews with same user on the same tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

// reviewSchema.pre(/^find/, function (next) {
//     this.populate({
//         path: 'tour',
//         select: 'name'
//     }).populate({
//         path: 'user',
//         select: 'name photo'
//     })
//     next()
// })


reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next()
})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([//(this) points to the current model (review)
        {//get the tour i wonted 
            $match: { tour: tourId }// the name of the statage must start with ($)
        },
        {// do some statistics on the review
            $group: {// the statage name
                _id: '$tour',//Get the value of the tour field from each document / (_id) this is the name witch apper in the output  
                nRating: { $sum: 1 },// the operator must start with ($)
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    console.log(stats)//[{_id: 6a53a1b193fe4c60d828427e,nRating: 3,avgRating: 4.333333333333333}]

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            retingsQantity: stats[0].nRating,
            retingsAverage: stats[0].avgRating
        })
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            retingsQantity: 0,
            retingsAverage: 4.5
        })
    }

}
reviewSchema.post('save', function () {//Document midllewar
    // this points to current review
    this.constructor.calcAverageRatings(this.tour);// = Document.tour 
})

//findByIdAndUpdate
//findByIdAndDelete

// her we don't have access to review document to get from thier tourId and do statistics like the above becouse we now deal with the query 
reviewSchema.pre(/^findOneAnd/, async function (next) {//query midlleware
    this.rev = await this.findOne();// her we can get the review document from the query and store it in rev
    console.log(this.rev)
    next();
})

reviewSchema.post(/^findOneAnd/, async function () {
    // await this.findOne(); does not work here, query has already exceuted
    await this.rev.constructor.calcAverageRatings(this.rev.tour)
})

const Review = Mongoose.model('Review', reviewSchema)

module.exports = Review