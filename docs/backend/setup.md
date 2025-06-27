# Backend Setup Guide

This guide will help you set up the StayFinder backend for development.

## Prerequisites

Before you begin, make sure you have the following installed:

-   Node.js (v18 or later)
-   npm (v9 or later)
-   MongoDB (v6 or later)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd StayFinder/server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the server directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
DB_URI=mongodb://localhost:27017/stayfinder

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (for sending emails)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
EMAIL_FROM=noreply@stayfinder.com

# Geocoding API (for location services)
GEOCODING_API_KEY=your_geocoding_api_key
```

Replace the placeholder values with your actual configuration.

## Database Setup

1. Start MongoDB:

```bash
# If using MongoDB as a service
sudo service mongod start

# Or if using MongoDB directly
mongod
```

2. The application will automatically create the necessary collections when it first connects to the database.

## Running the Server

### Development Mode

To run the server in development mode with hot reloading:

```bash
npm run dev
```

The server will start on the port specified in your `.env` file (default: 5000).

### Production Mode

To run the server in production mode:

```bash
npm start
```

## Admin User Setup

To create an admin user, run the following script:

```bash
node scripts/create-admin.js
```

This will prompt you to enter details for the admin user.

## Property Approval

To approve properties (for admin users), run:

```bash
node scripts/approve-properties.js
```

## API Testing

You can test the API endpoints using tools like Postman or curl. The base URL for the API is:

```
http://localhost:5000/api
```

## Troubleshooting

### Connection Issues

If you encounter connection issues with MongoDB, make sure:

1. MongoDB service is running
2. The connection string in your `.env` file is correct
3. MongoDB is listening on the expected port

### Authentication Issues

If you encounter JWT authentication issues:

1. Check that your JWT_SECRET is properly set in the `.env` file
2. Verify that the token is being sent in the Authorization header with the Bearer prefix

### Image Upload Issues

If image uploads are failing:

1. Verify your Cloudinary credentials in the `.env` file
2. Check that the Cloudinary service is available
3. Ensure the upload directory has proper permissions

## Next Steps

Once your backend is set up and running, you can:

1. Explore the API using the [API Reference](../api/README.md)
2. Set up the [Frontend](../frontend/setup.md)
3. Learn about the [Database Schema](../architecture/database-schema.md)
