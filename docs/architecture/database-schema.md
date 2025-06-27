# Database Schema

This document describes the database schema for the StayFinder application.

## Overview

StayFinder uses MongoDB as its database, with Mongoose as the ODM (Object Document Mapper). The database consists of several collections, each representing a different entity in the application.

## Collections

### Users

The `users` collection stores information about users of the application.

#### Schema

| Field                  | Type       | Description                           |
| ---------------------- | ---------- | ------------------------------------- |
| `_id`                  | ObjectId   | Unique identifier                     |
| `name`                 | String     | User's full name                      |
| `email`                | String     | User's email address (unique)         |
| `password`             | String     | Hashed password                       |
| `profilePicture`       | String     | URL to profile picture                |
| `phone`                | String     | User's phone number                   |
| `role`                 | String     | User role: "user", "host", or "admin" |
| `isVerified`           | Boolean    | Whether email is verified             |
| `isActive`             | Boolean    | Account status                        |
| `suspensionReason`     | String     | Reason if account is suspended        |
| `bio`                  | String     | User biography                        |
| `favorites`            | [ObjectId] | Array of favorited property IDs       |
| `passwordResetToken`   | String     | Token for password reset              |
| `passwordResetExpires` | Date       | Expiration for reset token            |
| `createdAt`            | Date       | Account creation date                 |
| `updatedAt`            | Date       | Last update date                      |

#### Indexes

-   Unique index on `email` field
-   Index on `role` field

### Properties

The `properties` collection stores information about property listings.

#### Schema

| Field                   | Type     | Description                            |
| ----------------------- | -------- | -------------------------------------- |
| `_id`                   | ObjectId | Unique identifier                      |
| `title`                 | String   | Property title                         |
| `description`           | String   | Detailed description                   |
| `type`                  | String   | Property type (apartment, house, etc.) |
| `price`                 | Number   | Price per night/week/month             |
| `pricePeriod`           | String   | "night", "weekly", or "monthly"        |
| `bedrooms`              | Number   | Number of bedrooms                     |
| `bathrooms`             | Number   | Number of bathrooms                    |
| `maxGuests`             | Number   | Maximum number of guests allowed       |
| `address`               | Object   | Property address                       |
| `address.street`        | String   | Street address                         |
| `address.city`          | String   | City                                   |
| `address.state`         | String   | State/Province                         |
| `address.zipCode`       | String   | Zip/Postal code                        |
| `address.country`       | String   | Country                                |
| `location`              | Object   | GeoJSON location data                  |
| `location.type`         | String   | "Point"                                |
| `location.coordinates`  | [Number] | [longitude, latitude]                  |
| `amenities`             | [String] | List of amenities                      |
| `images`                | [Object] | Property images                        |
| `images.url`            | String   | Image URL                              |
| `images.caption`        | String   | Image caption                          |
| `host`                  | ObjectId | Reference to User model                |
| `isAvailable`           | Boolean  | Availability status                    |
| `isApproved`            | Boolean  | Admin approval status                  |
| `rejectionReason`       | String   | Reason if rejected                     |
| `rules`                 | Object   | House rules                            |
| `rules.checkIn`         | String   | Check-in time                          |
| `rules.checkOut`        | String   | Check-out time                         |
| `rules.smoking`         | Boolean  | Smoking allowed                        |
| `rules.pets`            | Boolean  | Pets allowed                           |
| `rules.parties`         | Boolean  | Parties allowed                        |
| `rules.events`          | Boolean  | Events allowed                         |
| `rules.quietHours`      | String   | Quiet hours                            |
| `rules.additionalRules` | [String] | Additional rules                       |
| `avgRating`             | Number   | Average rating (0-5)                   |
| `reviewCount`           | Number   | Number of reviews                      |
| `featuredUntil`         | Date     | Date until property is featured        |
| `createdAt`             | Date     | Creation date                          |
| `updatedAt`             | Date     | Last update date                       |

#### Indexes

-   Geospatial index on `location` field
-   Text index on `title`, `description`, and address fields
-   Index on `host` field
-   Index on `isApproved` and `isAvailable` fields
-   Index on `featuredUntil` field

### Bookings

The `bookings` collection stores information about property reservations.

#### Schema

| Field                | Type     | Description                                      |
| -------------------- | -------- | ------------------------------------------------ |
| `_id`                | ObjectId | Unique identifier                                |
| `property`           | ObjectId | Reference to Property model                      |
| `guest`              | ObjectId | Reference to User model (guest)                  |
| `host`               | ObjectId | Reference to User model (host)                   |
| `checkInDate`        | Date     | Check-in date                                    |
| `checkOutDate`       | Date     | Check-out date                                   |
| `numberOfGuests`     | Number   | Number of guests                                 |
| `totalPrice`         | Number   | Total price for the stay                         |
| `status`             | String   | "pending", "confirmed", "cancelled", "completed" |
| `paymentStatus`      | String   | "pending", "paid", "refunded", "failed"          |
| `paymentId`          | String   | Payment reference ID                             |
| `specialRequests`    | String   | Special requests from guest                      |
| `cancellationReason` | String   | Reason if cancelled                              |
| `cancelledBy`        | String   | "guest", "host", "admin", or null                |
| `cancelledAt`        | Date     | Date of cancellation                             |
| `createdAt`          | Date     | Creation date                                    |
| `updatedAt`          | Date     | Last update date                                 |

#### Indexes

-   Compound index on `property`, `checkInDate`, and `checkOutDate`
-   Index on `guest` and `status`
-   Index on `host` and `status`
-   Index on `property` and `status`

### Reviews

The `reviews` collection stores reviews left by guests for properties.

#### Schema

| Field                | Type     | Description                 |
| -------------------- | -------- | --------------------------- |
| `_id`                | ObjectId | Unique identifier           |
| `property`           | ObjectId | Reference to Property model |
| `booking`            | ObjectId | Reference to Booking model  |
| `guest`              | ObjectId | Reference to User model     |
| `rating`             | Number   | Rating (1-5)                |
| `comment`            | String   | Review text                 |
| `response`           | Object   | Host's response             |
| `response.text`      | String   | Response text               |
| `response.createdAt` | Date     | Response date               |
| `isVisible`          | Boolean  | Visibility status           |
| `createdAt`          | Date     | Creation date               |
| `updatedAt`          | Date     | Last update date            |

#### Indexes

-   Index on `property` field
-   Index on `guest` field
-   Index on `booking` field
-   Compound index on `property` and `isVisible`

### BlockedDates

The `blockedDates` collection stores dates when properties are unavailable for booking.

#### Schema

| Field       | Type     | Description                  |
| ----------- | -------- | ---------------------------- |
| `_id`       | ObjectId | Unique identifier            |
| `property`  | ObjectId | Reference to Property model  |
| `startDate` | Date     | Start date of blocked period |
| `endDate`   | Date     | End date of blocked period   |
| `reason`    | String   | Reason for blocking          |
| `createdAt` | Date     | Creation date                |
| `updatedAt` | Date     | Last update date             |

#### Indexes

-   Index on `property` field
-   Compound index on `property`, `startDate`, and `endDate`

## Relationships

### One-to-Many Relationships

-   User to Properties: A user (host) can have multiple properties
-   User to Bookings (as guest): A user can make multiple bookings
-   User to Bookings (as host): A host can receive multiple bookings
-   User to Reviews: A user can write multiple reviews
-   Property to Bookings: A property can have multiple bookings
-   Property to Reviews: A property can have multiple reviews
-   Property to BlockedDates: A property can have multiple blocked dates

### Many-to-Many Relationships

-   Users to Properties (favorites): Users can favorite multiple properties, and properties can be favorited by multiple users

## Data Integrity

Data integrity is maintained through:

1. **Validation**: Mongoose schemas include validation rules for fields
2. **Indexes**: Appropriate indexes are created for performance and data integrity
3. **References**: References between collections are maintained using ObjectId references
4. **Middleware**: Mongoose middleware is used for operations like password hashing

## Schema Evolution

As the application evolves, the database schema may need to change. Changes to the schema should be carefully planned and executed to avoid data loss or corruption. Consider using techniques like:

1. **Schema versioning**: Track schema versions and migrate data as needed
2. **Backward compatibility**: Ensure new schema versions can work with old data
3. **Data migration scripts**: Create scripts to migrate data from old schema to new schema
