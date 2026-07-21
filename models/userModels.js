const Mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')


const userSchema = new Mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'please tell us your name'],
        // maxlength: [40, 'must have less than 40 char!'],
        // minlength: [10, 'must have more than 10 char!']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'please tell us your email'],
        lowercase: true,
        validate: [validator.isEmail, 'please provide vaild email']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'please provide a password'],
        minlength: 8,
        select: false // this will disapper password
    },
    passwordConfirm: {
        type: String,
        required: [true, 'please confirm your password'],
        validate: {
            validator: function (val) {// this only works on CREATE OR SAVE !!!!!!
                return val === this.password
            },
            message: 'password are not the same!!'
        }
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }

})


userSchema.pre('save', async function (next) {
    //only run this func if password was actually modified
    if (!this.isModified('password')) return next() // (this) her refer to the current user document
    //her we will use bcrypt to hash the password , but before that it will add salt to the password 
    this.password = await bcrypt.hash(this.password, 12) // 12 is cost parameter 
    //Delete the password Confirm
    this.passwordConfirm = undefined;

    next()
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangeAt = Date.now() - 1000;
    next()
})

//this will prevent all user with active property with false
userSchema.pre(/^find/, function (next) { // this regular exp her select ( findeOne , findById ....)
    this.find({ active: { $ne: false } });//(this) points to the current Query
    next();
})


//this is instance method witch will work on everywhere in the project
userSchema.methods.correctPassword = async function (canaditePassword, userPassword) {
    //canaditePassword the plain password that just enterd by the user
    //userPassword the hashed password stored in the database
    return await bcrypt.compare(canaditePassword, userPassword)//that will return True or False
}


userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangeAt) {
        const changedTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10);

        return JWTTimestamp < changedTimestamp
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    const reseToken = crypto.randomBytes(32).toString('hex')// create random 32 bytes

    this.passwordResetToken = crypto.createHash('sha256').update(reseToken).digest('hex');

    console.log({ reseToken }, this.passwordResetToken)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000

    return reseToken
}

const User = Mongoose.model('User', userSchema)

module.exports = User