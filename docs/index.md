# StayFinder Documentation

Welcome to the StayFinder documentation. This comprehensive guide will help you understand, set up, and contribute to the StayFinder application.

## What is StayFinder?

StayFinder is a full-stack property rental application that allows users to find and book accommodations, hosts to list their properties, and administrators to manage the platform. It's built with modern web technologies including React, Node.js, Express, and MongoDB.

## Quick Links

### Getting Started

-   [Backend Setup](./backend/setup.md)
-   [Frontend Setup](./frontend/setup.md)

### Architecture

-   [System Overview](./architecture/overview.md)
-   [Database Schema](./architecture/database-schema.md)
-   [Authentication Flow](./architecture/authentication.md)

### Backend Documentation

-   [API Structure](./backend/api-structure.md)
-   [Models](./backend/models.md)

### Frontend Documentation

-   [Component Structure](./frontend/component-structure.md)
-   [Routing](./frontend/routing.md)
-   [State Management](./frontend/state-management.md)

### API Reference

-   [Authentication Endpoints](./api/authentication.md)
-   [Property Endpoints](./api/properties.md)
-   [Booking Endpoints](./api/bookings.md)
-   [Review Endpoints](./api/reviews.md)

### Deployment

-   [Environment Configuration](./deployment/environment.md)

## Key Features

StayFinder offers a range of features for different user roles:

### For Guests

-   Search for properties by location, dates, and filters
-   View property details, amenities, and reviews
-   Book properties for specific dates
-   Manage bookings (view, cancel)
-   Leave reviews for past stays
-   Save favorite properties

### For Hosts

-   List properties with details, amenities, and images
-   Manage property availability
-   Receive and manage booking requests
-   Respond to guest reviews
-   View booking statistics and earnings

### For Administrators

-   Approve or reject property listings
-   Manage users (activate, deactivate)
-   View platform statistics
-   Moderate reviews and content

## Technology Stack

### Frontend

-   React 19
-   React Router 7
-   TanStack Query
-   Tailwind CSS
-   React Hook Form
-   Zod (validation)
-   Leaflet (maps)

### Backend

-   Node.js
-   Express.js
-   MongoDB with Mongoose
-   JWT Authentication
-   Joi (validation)
-   Cloudinary (image storage)
-   Nodemailer (email)

## Project Structure

The project is organized into two main directories:

### Client

```
client/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── constants/       # Application constants
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── layouts/         # Page layout components
│   ├── pages/           # Page components
│   ├── routes/          # Routing configuration
│   ├── services/        # API service functions
│   ├── styles/          # Global styles
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main application component
│   ├── index.css        # Global CSS
│   └── main.jsx         # Entry point
```

### Server

```
server/
├── scripts/             # Utility scripts
├── src/
│   ├── app.js           # Express application setup
│   ├── config/          # Configuration files
│   ├── constants/       # Application constants
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Express middlewares
│   ├── models/          # Mongoose models
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── validators/      # Request validation schemas
└── server.js            # Entry point
```

## License

StayFinder is licensed under the MIT License. See the LICENSE file for details.
