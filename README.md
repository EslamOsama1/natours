# Natours API

A RESTful API for a tour booking application built with **Node.js, Express.js, MongoDB, and Mongoose**.

The project provides a complete backend architecture for managing tours, users, reviews, authentication, and tour bookings.

## 🚀 Features

### 🔐 Authentication & Authorization

* User signup and login
* JWT-based authentication
* Protected routes
* Role-based authorization
* Password hashing
* Forgot and reset password functionality
* Update password
* Update user data
* Delete user account

### 🗺️ Tours

* Create, read, update, and delete tours
* Get tour details
* Filter tours by different fields
* Sort tours
* Search tours
* Field limiting
* Pagination
* Advanced API features

### 👤 Users

* User registration and login
* Manage user information
* Update user profile
* User roles and permissions

### ⭐ Reviews

* Create reviews
* Update reviews
* Delete reviews
* Rating system
* Reviews associated with users and tours

### 🛡️ Security

* Helmet
* CORS
* Rate limiting
* Data sanitization
* XSS protection
* HTTP Parameter Pollution protection
* Secure authentication with JWT

### ⚠️ Error Handling

* Centralized error handling
* Operational error handling
* MongoDB error handling
* Validation errors
* JWT errors
* Cast errors
* Duplicate field errors

## 🛠️ Technologies

* **Node.js**
* **Express.js**
* **MongoDB**
* **Mongoose**
* **JWT**
* **bcryptjs**
* **Multer**
* **Nodemailer**
* **Helmet**
* **Express Rate Limit**
* **Mongo Sanitize**
* **XSS Clean**
* **HPP**

## 📁 Project Structure

```text
natours/
│
├── controllers/
│   ├── authController.js
│   ├── errorController.js
│   ├── handlerFactory.js
│   ├── reviewController.js
│   ├── tourController.js
│   └── userController.js
│
├── models/
│   ├── reviewModel.js
│   ├── tourModel.js
│   └── userModel.js
│
├── Routes/
│   ├── reviewRoutes.js
│   ├── tourRoutes.js
│   └── userRoutes.js
│
├── utils/
│   ├── apiFeatures.js
│   ├── appError.js
│   └── catchAsync.js
│
├── public/
├── starter/
├── app.js
├── server.js
├── import-dev-data.js
├── package.json
└── .gitignore
```

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/EslamOsama1/natours.git
```

Navigate to the project directory:

```bash
cd natours
```

Install dependencies:

```bash
npm install
```

## 🔑 Environment Variables

Create a `config.env` file inside the `config` folder and add your environment variables:

```env
NODE_ENV=development
PORT=3000
DATABASE=your_mongodb_connection_string
DATABASE_PASSWORD=your_database_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d

EMAIL_USERNAME=your_email
EMAIL_PASSWORD=your_email_password
EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
```

> Never commit your real environment variables or secrets to GitHub.

## ▶️ Running the Project

Start the development server:

```bash
npm run start:dev
```

Or start the production server:

```bash
npm start
```

The API will be available at:

```text
http://localhost:3000
```

## 📡 API

### Tours

```http
GET /api/v1/tours
GET /api/v1/tours/:id
POST /api/v1/tours
PATCH /api/v1/tours/:id
DELETE /api/v1/tours/:id
```

### Users

```http
GET /api/v1/users
GET /api/v1/users/:id
POST /api/v1/users
PATCH /api/v1/users/:id
DELETE /api/v1/users/:id
```

### Authentication

```http
POST /api/v1/users/signup
POST /api/v1/users/login
POST /api/v1/users/forgotPassword
PATCH /api/v1/users/resetPassword/:token
PATCH /api/v1/users/updateMyPassword
PATCH /api/v1/users/updateMe
DELETE /api/v1/users/deleteMe
```

### Reviews

```http
GET /api/v1/reviews
POST /api/v1/reviews
PATCH /api/v1/reviews/:id
DELETE /api/v1/reviews/:id
```

## 🔎 API Features

The API supports advanced querying features including:

* Filtering
* Sorting
* Field limiting
* Pagination
* Search
* Nested routes
* Population of related documents

Example:

```http
GET /api/v1/tours?duration[gte]=5&difficulty=easy&sort=-price
```

## 🗄️ Database

The application uses **MongoDB** as the database and **Mongoose** as the ODM.

Main database models:

* User
* Tour
* Review

Relationships are implemented between users, tours, and reviews using Mongoose references.

## 📮 Postman

The API can be tested using **Postman** or any other API testing tool.

You can test authentication, CRUD operations, filtering, sorting, pagination, reviews, and protected routes.

## 👨‍💻 Author

**Eslam Osama**

GitHub:
https://github.com/EslamOsama1

## 📌 Project Status

This project was built as a backend REST API project using Node.js and Express.js, focusing on authentication, authorization, database relationships, API features, security, and scalable backend architecture.

## 📄 License

This project is for educational and portfolio purposes.
