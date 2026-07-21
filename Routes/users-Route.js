const express = require('express')
const userController = require('../controllers/userControllers')
const authController = require('../controllers/authController')


let userRouter = express.Router();

//theis endpoint didn't need a protect every on can do all of them
userRouter.post('/signup', authController.signup) // this is special rout 
userRouter.post('/login', authController.login)
userRouter.post('/forgotPassword', authController.forgotPassword)//will reciev the email address
userRouter.patch('/resetPassword/:token', authController.resetPassword)//will reciev the token


//form her to the end every endpoint need protect and we will not add to every on insted we will 
//add a midleware like that 

userRouter.use(authController.protect)// now every endpoint comming after this midleware will become protected by default

userRouter.patch('/updateMyPassword', authController.updatePassword)
userRouter.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe)// Upload a single image from the "photo" field and save it to req.file.
userRouter.delete('/deleteMe', userController.deleteMe)
userRouter.get('/me', userController.getMe, userController.getUser)



userRouter.use(authController.restrictTo('admin'))//now this routs belong to the admin 

userRouter.route('/')
    .all(userController.getAllUsers)
// .post(userController.createUsers)



userRouter.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)


module.exports = userRouter;

