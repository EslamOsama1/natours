const Mongoose = require('mongoose')
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModels');




//we need to create schema first to create a model
const tourSchema = new Mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'must have less than 40 char!'],
        minlength: [10, 'must have more than 10 char!'],
        // validate: [validator.isAlpha, 'the name must be char only'] //this will consider the spacies as anot char and will return error
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: ['easy', 'medium', 'difficult'] // this for string only
    },
    retingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'rating must be above 1'],//it will work with number or Dates
        max: [5, 'rating must be below 5'],
        set: valu => Math.round(val * 10) / 10 // function to round the output of the average
    },
    retingsQantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a Price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) { // this val point to the amunt of the discount
                return val < this.price; // (this) only points to the current doc on New document creation 
            }
        },
        message: 'Discount price ({val}) should be below the regular price'
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover images']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false // in this way i prevent these header from sending to the clint 
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        //GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number], // this mean that we expect an array of numbers
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    //Embeded
    // guides: Array   
    //referance
    guides: [
        {
            type: Mongoose.Schema.ObjectId,
            ref: 'User' // her will didn't need this (const User = require('./userModels'))
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

// tourSchema.index({ price: 1 }) // Ascending = 1 
tourSchema.index({ price: 1, retingsAverage: -1 }) // descending = -1 
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation: '2dsphere' })

tourSchema.virtual('durationWeeks').get(function () { // this will not stored in DB and you can't query on it ,but it will appear in the body of the response
    return this.duration / 7
})

//virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

//Document Midleware
// this how to create document midleware on the mongo ,this midleware will excute before .save() .create()
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true }) // this will point into the current document 
    next();
})

//this how we can embaded a user doc into a tour doc and return all the user data not only the id
// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id))//on every itration this return a promise and we will get a group of promises
//     this.guides = await Promise.all(guidesPromises); // now this will handle the all promises all at once
//     next();
// })

//we can also have a multiple pre midleware
// tourSchema.pre('save', function (next) {
//     console.log('will save document...')
//     next();
// })
// tourSchema.post('save', function (doc, next) { // doc reffer into the finished document 
//     console.log(doc);
//     next();
// })


//Query Midleware
// in this type of MW we will deal with query and now this will point into the current query 
tourSchema.pre(/^find/, function (next) {
    // tourSchema.pre('find', function (next) { //this will work only with find() not findOne() or findByIdAndUpdate() or ....
    this.find({ secretTour: { $ne: true } })
    this.start = Date.now()
    next()
})

//this how to papulate the referanced data
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangeAt'
    })
    next()
})

tourSchema.post(/^find/, function (docs, next) {// docs reffer to all the document return by the query
    console.log(docs);
    console.log(`Query took ${Date.now() - this.start} millsecounds!`)
    next()
})



//Aggregation Middleware
// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({ '$match': { secretTour: { $ne: true } } })
//     console.log(this.pipeline())
//     next()
// })





// her we create a simple model with our schema 
const Tour = Mongoose.model('Tour', tourSchema);// make sure that the model name start with uppercase

// // her we create a simple document with our model 
// const testTour = new Tour({
//     name: 'The Park Camper',
//     // rating: 4.7,
//     price: 998
// })
// testTour.save().then(doc => {
//     console.log(doc)
// }).catch(err => console.log('ERROR ', err))

module.exports = Tour