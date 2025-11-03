# CineScope Movie Streaming Platform

CineScope is a movie streaming platform built with Node.js, Express, and MongoDB. This application allows users to authenticate, manage their profiles, and explore a wide range of movies.

## Features

- User authentication (registration and login)
- Movie management (fetching popular movies, searching for movies, getting movie details)
- User profile management (updating profiles, managing watch history)

## Project Structure

```
cinescope-backend
├── controllers
│   ├── authController.js
│   ├── movieController.js
│   └── userController.js
├── models
│   ├── Movie.js
│   ├── User.js
│   └── index.js
├── routes
│   ├── authRoutes.js
│   ├── movieRoutes.js
│   └── userRoutes.js
├── middlewares
│   ├── authMiddleware.js
│   └── errorHandler.js
├── utils
│   └── db.js
├── .env
├── package.json
├── server.js
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd cinescope-backend
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory and add your MongoDB connection string:
   ```
   MONGODB_URI=<your-mongodb-uri>
   ```

## Running the Application

To start the server, run:
```
npm start
```
The server will run on `http://localhost:5000`.

## API Endpoints

### Authentication

- **POST /api/auth/register**: Register a new user
- **POST /api/auth/login**: Login an existing user

### Movies

- **GET /api/movies/popular**: Fetch popular movies
- **GET /api/movies/:id**: Get details of a specific movie
- **GET /api/movies/search**: Search for movies

### User Profile

- **GET /api/users/profile**: Fetch user profile
- **PUT /api/users/profile**: Update user profile
- **GET /api/users/watch-history**: Get user's watch history

## Middleware

- **authMiddleware**: Protects routes by verifying JWT tokens.
- **errorHandler**: Handles errors and provides consistent error responses.

## License

This project is licensed under the MIT License.