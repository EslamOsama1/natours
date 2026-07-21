const fs = require('fs')
const dotenv = require('dotenv')
const Mongoose = require('mongoose')
const Tour = require('./models/tourModels')
const User = require('./models/userModels')
const Review = require('./models/reviewModels')

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

Mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('DB connection successful!')
)


//read json file
const tours = JSON.parse(fs.readFileSync("./starter/dev-data/data/tours.json", "utf-8"));
const users = JSON.parse(fs.readFileSync("./starter/dev-data/data/users.json", "utf-8"));
const reviews = JSON.parse(fs.readFileSync("./starter/dev-data/data/reviews.json", "utf-8"));


//import data into DB
const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);

        console.log('data sucessfully loaded')
    } catch (err) {
        console.log(err)
    }
    process.exit()
}// to call this function we write in the terminal (node import-dev-data.js --import)

//Delete all data from the DB
const deleteData = async () => {
    try {
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log('data sucessfully Deleted')
    } catch (err) {
        console.log(err)
    }
    process.exit()
}// to call this function we write in the terminal (node import-dev-data.js --delete)


// console.log(process.argv)

if (process.argv[2] === "--import") {
    importData();
} else if (process.argv[2] == "--delete") {
    deleteData()
}


