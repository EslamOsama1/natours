# Natours API

A complete RESTful API for a tour booking application built with **Node.js, Express.js, MongoDB, and Mongoose**.

Natours provides a scalable backend architecture for managing tours, users, reviews, authentication, authorization, and tour bookings.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* User signup and login
* JWT-based authentication
* Protected routes
* Role-based authorization
* Password hashing with bcrypt
* Forgot password functionality
* Reset password functionality
* Update password
* Update user profile
* Delete user account
* Check password changes after JWT creation

### 🗺️ Tours

* Create tours
* Get all tours
* Get tour by ID
* Update tours
* Delete tours
* Filter tours
* Sort tours
* Search tours
* Field limiting
* Pagination
* Advanced API querying
* Tour statistics
* Top 5 tours
* Tours within a specific distance
* Geospatial queries

### 👤 Users

* User registration
* User authentication
* Manage users
* Update user information
* Update profile photo
* Delete users
* User roles and permissions
* Active/inactive user status

### ⭐ Reviews

* Create reviews
* Get reviews
* Get review by ID
* Update reviews
* Delete reviews
* Rating system from 1 to 5
* Reviews associated with users and tours
* Prevent duplicate reviews for the same tour by the same user

### 🏨 Bookings

* Create tour bookings
* Get bookings
* Get booking by ID
* Update bookings
* Delete bookings
* Associate bookings with users
* Associate bookings with tours
* Protected booking routes
* Authorization for booking operations
* Store booking data in MongoDB

### 📧 Email

* Send emails using Nodemailer
* Password reset emails
* Email templates
* SMTP configuration

### 🖼️ File Uploads

* Upload user profile images
* Image processing using Sharp
* Store and manage uploaded images
* Support multiple image formats

### 🛡️ Security

* Helmet
* CORS
* Rate limiting
* MongoDB query sanitization
* XSS protection
* HTTP Parameter Pollution protection
* Secure password hashing
* JWT authentication

### ⚠️ Error Handling

* Centralized error handling
* Operational errors
* MongoDB errors
* Validation errors
* JWT errors
* JWT expiration errors
* Cast errors
* Duplicate field errors

---

## 🛠️ Technologies

* **Node.js**
* **Express.js**
* **MongoDB**
* **Mongoose**
* **JWT**
* **bcryptjs**
* **Nodemailer**
* **Multer**
* **Sharp**
* **Helmet**
* **CORS**
* **Express Rate Limit**
* **Express Mongo Sanitize**
* **XSS Clean**
* **HPP**

---

## 📁 Project Structure

```text
natours/
│
├── controllers/
│   ├── authController.js
│   ├── bookingController.js
│   ├── errorController.js
│   ├── handlerFactory.js
│   ├── reviewController.js
│   ├── tourController.js
│   └── userController.js
│
├── models/
│   ├── bookingModel.js
│   ├── reviewModel.js
│   ├── tourModel.js
│   └── userModel.js
│
├── Routes/
│   ├── bookingRoutes.js
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
│
├── starter/
│
├── views/
│
├── app.js
├── server.js
├── import-dev-data.js
├── package.json
└── .gitignore
```

---

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

---

## 🔑 Environment Variables

Create a `config.env` file inside the `config` folder.

Example:

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

---

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

---

## 📡 API Endpoints

### 🔐 Authentication

```http
POST /api/v1/users/signup
POST /api/v1/users/login
POST /api/v1/users/forgotPassword
PATCH /api/v1/users/resetPassword/:token
PATCH /api/v1/users/updateMyPassword
PATCH /api/v1/users/updateMe
DELETE /api/v1/users/deleteMe
```

### 🗺️ Tours

```http
GET /api/v1/tours
GET /api/v1/tours/:id
POST /api/v1/tours
PATCH /api/v1/tours/:id
DELETE /api/v1/tours/:id
```

### 👤 Users

```http
GET /api/v1/users
GET /api/v1/users/:id
POST /api/v1/users
PATCH /api/v1/users/:id
DELETE /api/v1/users/:id
```

### ⭐ Reviews

```http
GET /api/v1/reviews
GET /api/v1/reviews/:id
POST /api/v1/reviews
PATCH /api/v1/reviews/:id
DELETE /api/v1/reviews/:id
```

### 🏨 Bookings

```http
GET /api/v1/bookings
GET /api/v1/bookings/:id
POST /api/v1/bookings
PATCH /api/v1/bookings/:id
DELETE /api/v1/bookings/:id
```

---

## 🔎 Advanced API Features

The API supports advanced querying capabilities:

* Filtering
* Sorting
* Field limiting
* Pagination
* Search
* Nested routes
* MongoDB population
* Geospatial queries
* Aggregation pipelines

### Example

```http
GET /api/v1/tours?duration[gte]=5&difficulty=easy&sort=-price
```

This allows filtering tours by duration and difficulty while sorting them by price.

---

## 📍 Geospatial Features

Natours supports location-based tour searches.

Users can search for tours within a specific distance from a given location.

Example:

```http
GET /api/v1/tours/tours-within/:distance/center/:latlng/unit/:unit
```

Supported units include:

* `mi` — Miles
* `km` — Kilometers

---

## 🗄️ Database

The application uses **MongoDB** as the database and **Mongoose** as the ODM.

### Main Models

* **User**
* **Tour**
* **Review**
* **Booking**

### Relationships

```text
User
 ├── Reviews
 └── Bookings

Tour
 ├── Reviews
 └── Bookings

Review
 ├── User
 └── Tour

Booking
 ├── User
 └── Tour
```

---

## 📮 API Testing

The API can be tested using:

* Postman
* Insomnia
* Thunder Client
* Any REST API client

You can test authentication, CRUD operations, filtering, sorting, pagination, reviews, bookings, and protected routes.

---

## 🔒 Protected Routes

Some endpoints require authentication using a JWT token.

Example:

```http
Authorization: Bearer <your_jwt_token>
```

Protected resources include:

* User profile
* Reviews
* Bookings
* Administrative operations

---

## 📊 API Architecture

The project follows a modular backend architecture:

```text
Client
   ↓
Routes
   ↓
Controllers
   ↓
Models
   ↓
MongoDB
```

Additional middleware is used for:

* Authentication
* Authorization
* Validation
* Error handling
* Security
* Request processing

---

## 🌐 Project Links

### GitHub

https://github.com/EslamOsama1/natours

### Live API

Add your deployment URL here after deploying the project.

---

## 👨‍💻 Author

**Eslam Osama**

GitHub:

https://github.com/EslamOsama1

---

## 📌 Project Status

This project was developed as a backend REST API for a tour booking platform.

It demonstrates practical experience with **Node.js, Express.js, MongoDB, Mongoose, REST APIs, authentication, authorization, database relationships, security, geospatial queries, file uploads, email services, and booking management**.

---

## 📄 License

This project is for educational and portfolio purposes.
