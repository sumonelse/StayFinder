# Environment Configuration

This document describes the environment configuration for the StayFinder application.

## Overview

StayFinder uses environment variables to configure the application for different environments (development, staging, production). This approach allows for flexible configuration without changing the code.

## Backend Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/stayfinder

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

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Logging Configuration
LOG_LEVEL=debug

# Rate Limiting
RATE_LIMIT_WINDOW_MS=15*60*1000
RATE_LIMIT_MAX=100
```

## Frontend Environment Variables

Create a `.env` file in the `client` directory with the following variables:

```
VITE_API_URL=http://localhost:5000/api
VITE_MAPS_API_KEY=your_maps_api_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## Environment-Specific Configuration

### Development Environment

Development environment is used for local development.

#### Backend

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stayfinder
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173
```

#### Frontend

```
VITE_API_URL=http://localhost:5000/api
```

### Staging Environment

Staging environment is used for testing before production deployment.

#### Backend

```
NODE_ENV=staging
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/stayfinder
LOG_LEVEL=info
CORS_ORIGIN=https://staging.stayfinder.com
```

#### Frontend

```
VITE_API_URL=https://api-staging.stayfinder.com/api
```

### Production Environment

Production environment is used for the live application.

#### Backend

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/stayfinder
LOG_LEVEL=error
CORS_ORIGIN=https://stayfinder.com
```

#### Frontend

```
VITE_API_URL=https://api.stayfinder.com/api
```

## Loading Environment Variables

### Backend

The backend uses the `dotenv` package to load environment variables from the `.env` file:

```javascript
// server.js
import dotenv from "dotenv"
dotenv.config()
```

Environment variables are then accessed through the `process.env` object:

```javascript
const port = process.env.PORT || 5000
```

For better organization, the application uses a centralized configuration object:

```javascript
// src/config/config.js
export const config = {
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 5000,
    mongodbUri: process.env.MONGODB_URI,
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    email: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        from: process.env.EMAIL_FROM,
    },
    geocoding: {
        apiKey: process.env.GEOCODING_API_KEY,
    },
    cors: {
        origin: process.env.CORS_ORIGIN,
    },
    logging: {
        level: process.env.LOG_LEVEL || "info",
    },
    rateLimit: {
        windowMs: eval(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
        max: process.env.RATE_LIMIT_MAX || 100,
    },
}
```

### Frontend

The frontend uses Vite's environment variable system. Variables must be prefixed with `VITE_` to be accessible in the frontend code:

```javascript
// src/config/config.js
export const config = {
    apiUrl: import.meta.env.VITE_API_URL,
    mapsApiKey: import.meta.env.VITE_MAPS_API_KEY,
    cloudinary: {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    },
}
```

## Environment Variables in CI/CD

When deploying the application using CI/CD pipelines, environment variables should be set in the CI/CD platform rather than committed to the repository.

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
    push:
        branches: [main]

jobs:
    deploy:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v2

            - name: Setup Node.js
              uses: actions/setup-node@v2
              with:
                  node-version: "18"

            - name: Install dependencies
              run: |
                  cd server
                  npm install
                  cd ../client
                  npm install

            - name: Build client
              run: |
                  cd client
                  npm run build
              env:
                  VITE_API_URL: ${{ secrets.VITE_API_URL }}
                  VITE_MAPS_API_KEY: ${{ secrets.VITE_MAPS_API_KEY }}
                  VITE_CLOUDINARY_CLOUD_NAME: ${{ secrets.VITE_CLOUDINARY_CLOUD_NAME }}
                  VITE_CLOUDINARY_UPLOAD_PRESET: ${{ secrets.VITE_CLOUDINARY_UPLOAD_PRESET }}

            - name: Deploy
              # Deployment steps
              env:
                  NODE_ENV: production
                  PORT: 5000
                  MONGODB_URI: ${{ secrets.MONGODB_URI }}
                  JWT_SECRET: ${{ secrets.JWT_SECRET }}
                  JWT_EXPIRES_IN: ${{ secrets.JWT_EXPIRES_IN }}
                  CLOUDINARY_CLOUD_NAME: ${{ secrets.CLOUDINARY_CLOUD_NAME }}
                  CLOUDINARY_API_KEY: ${{ secrets.CLOUDINARY_API_KEY }}
                  CLOUDINARY_API_SECRET: ${{ secrets.CLOUDINARY_API_SECRET }}
                  EMAIL_HOST: ${{ secrets.EMAIL_HOST }}
                  EMAIL_PORT: ${{ secrets.EMAIL_PORT }}
                  EMAIL_USER: ${{ secrets.EMAIL_USER }}
                  EMAIL_PASS: ${{ secrets.EMAIL_PASS }}
                  EMAIL_FROM: ${{ secrets.EMAIL_FROM }}
                  GEOCODING_API_KEY: ${{ secrets.GEOCODING_API_KEY }}
                  CORS_ORIGIN: ${{ secrets.CORS_ORIGIN }}
                  LOG_LEVEL: error
                  RATE_LIMIT_WINDOW_MS: 15*60*1000
                  RATE_LIMIT_MAX: 100
```

## Security Considerations

1. **Never commit `.env` files to the repository**:

    - Add `.env` files to `.gitignore`
    - Provide example `.env.example` files with placeholder values

2. **Use different values for different environments**:

    - Use different secrets for development, staging, and production
    - Use stronger secrets in production

3. **Restrict access to environment variables**:

    - Limit access to production environment variables
    - Use secret management services in production

4. **Validate environment variables**:
    - Check that required environment variables are set
    - Validate the format of environment variables

## Troubleshooting

### Missing Environment Variables

If the application fails to start or behaves unexpectedly, check that all required environment variables are set:

```javascript
// src/config/validateEnv.js
export const validateEnv = () => {
    const requiredEnvVars = [
        "MONGODB_URI",
        "JWT_SECRET",
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
    ]

    const missingEnvVars = requiredEnvVars.filter(
        (envVar) => !process.env[envVar]
    )

    if (missingEnvVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingEnvVars.join(
                ", "
            )}`
        )
    }
}
```

Call this function early in the application startup:

```javascript
// server.js
import dotenv from "dotenv"
import { validateEnv } from "./src/config/validateEnv.js"

dotenv.config()
validateEnv()
```

### Environment Variable Not Available in Frontend

If an environment variable is not available in the frontend, check that:

1. The variable is prefixed with `VITE_`
2. The variable is defined in the `.env` file
3. The application was restarted after changing the `.env` file
