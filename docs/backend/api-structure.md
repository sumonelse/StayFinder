# API Structure

This document outlines the structure of the StayFinder API, explaining how the different components work together to handle requests and responses.

## Overview

The StayFinder API follows a modular architecture with clear separation of concerns:

```
server/
├── src/
│   ├── app.js              # Express application setup
│   ├── config/             # Configuration files
│   ├── constants/          # Application constants
│   ├── controllers/        # Request handlers
│   ├── middlewares/        # Express middlewares
│   ├── models/             # Mongoose models
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   └── validators/         # Request validation schemas
└── server.js               # Entry point
```

## Request Flow

1. **Entry Point**: All requests enter through `server.js`, which sets up the Express application and connects to the database.

2. **Middleware Processing**: Requests pass through several middleware layers:

    - Security middleware (Helmet, CORS)
    - Request parsing middleware (JSON, URL-encoded)
    - Compression middleware
    - Logging middleware
    - Authentication middleware (for protected routes)

3. **Routing**: Requests are directed to the appropriate route handler in the `routes/` directory.

4. **Validation**: Request data is validated using schemas defined in the `validators/` directory.

5. **Controller**: The route handler calls the appropriate controller method from the `controllers/` directory.

6. **Service Layer**: Controllers delegate business logic to service functions from the `services/` directory.

7. **Data Access**: Services interact with the database through Mongoose models defined in the `models/` directory.

8. **Response**: The controller formats the response and sends it back to the client.

9. **Error Handling**: Errors at any stage are caught and processed by the error handling middleware.

## API Routes

The API is organized into the following route groups:

-   `/api/health`: Health check endpoints
-   `/api/auth`: Authentication endpoints
-   `/api/properties`: Property management endpoints
-   `/api/bookings`: Booking management endpoints
-   `/api/reviews`: Review management endpoints
-   `/api/uploads`: File upload endpoints
-   `/api/admin`: Admin-only endpoints
-   `/api/geocode`: Geocoding proxy endpoints

Each route group is defined in its own file in the `routes/` directory and is mounted in the main `routes/index.js` file.

## Authentication

The API uses JWT (JSON Web Token) for authentication. Protected routes use the `authenticate` middleware to verify the token and attach the user information to the request object.

## Error Handling

The API uses a centralized error handling approach:

1. Controllers use try-catch blocks to catch errors.
2. Errors are passed to the error handling middleware.
3. The middleware formats the error response based on the error type and sends it to the client.

## Validation

Request validation is handled by Joi schemas defined in the `validators/` directory. The validation middleware validates the request data against these schemas before passing the request to the controller.

## Logging

The API uses a structured logging approach with different log levels based on the environment:

-   Development: Detailed logs with request and response information
-   Production: Error logs and security-related logs

## Configuration

Application configuration is managed through environment variables and the `config/` directory. The `config.js` file loads environment variables and provides a centralized configuration object for the application.
