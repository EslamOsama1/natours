const dotenv = require('dotenv')//To use config.env
dotenv.config({ path: './config.env' });
const app = require('./app');//To use config.env
const Mongoose = require('mongoose')

process.on('unhandledRejection', err => {// this like event handler 
    console.log(err.name, err.message) //this a new way to handle Unhandeled rejacton
    console.log('UNHANDLER REJECTION!! Shutting dowen')
    process.exit(1);// 0 for success - 1 for uncought 

})

process.on('uncaughtException', err => {// this like event handler 
    console.log('UNCAUGHT EXEPTION!! Shutting dowen')
    console.log(err.name, err.message) //this a new way to handle uncaught Exception
    process.exit(1);
})

//To use config.env
dotenv.config({ path: './config.env' });


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
Mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('DB connection successful!')
)




let port = 8000
const server = app.listen(port, () => {
    console.log(`App running on ${port}`)
})
