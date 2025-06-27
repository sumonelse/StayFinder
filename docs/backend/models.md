# Database Models

This document describes the database models used in the StayFinder application.

## User Model

The User model represents users of the application, including regular users, hosts, and administrators.

### Schema

```javascript
{
  name: String,              // User's full name
  email: String,             // User's email address (unique)
  password: String,          // Hashed password
  profilePicture: String,    // URL to profile picture
  phone: String,             // User's phone number
  role: String,              // User role: "user", "host", or "admin"
  isVerified: Boolean,       // Whether email is verified
  isActive: Boolean,         // Account status
  suspensionReason: String,  // Reason if account is suspended
  bio: String,               // User biography
  favorites: [ObjectId],     // Array of favorited property IDs
  passwordResetToken: String,// Token for password reset
  passwordResetExpires: Date // Expiration for reset token
}
```

### Methods

-   `comparePassword(candidatePassword)`: Compares a candidate password with the stored hashed password

## Property Model

The Property model represents accommodation listings on the platform.

### Schema

```javascript
{
  title: String,             // Property title
  description: String,       // Detailed description
  type: String,              // Property type (apartment, house, etc.)
  price: Number,             // Price per night/week/month
  pricePeriod: String,       // "night", "weekly", or "monthly"
  bedrooms: Number,          // Number of bedrooms
  bathrooms: Number,         // Number of bathrooms
  maxGuests: Number,         // Maximum number of guests allowed
  address: {                 // Property address
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  location: {                // GeoJSON location data
    type: String,            // "Point"
    coordinates: [Number]    // [longitude, latitude]
  },
  amenities: [String],       // List of amenities
  images: [{                 // Property images
    url: String,
    caption: String
  }],
  host: ObjectId,            // Reference to User model
  isAvailable: Boolean,      // Availability status
  isApproved: Boolean,       // Admin approval status
  rejectionReason: String,   // Reason if rejected
  rules: {                   // House rules
    checkIn: String,
    checkOut: String,
    smoking: Boolean,
    pets: Boolean,
    parties: Boolean,
    events: Boolean,
    quietHours: String,
    additionalRules: [String]
  },
  avgRating: Number,         // Average rating (0-5)
  reviewCount: Number,       // Number of reviews
  featuredUntil: Date        // Date until property is featured
}
```

### Indexes

-   Geospatial index on `location` field for location-based queries
-   Text index on `title`, `description`, and address fields for search functionality

## Booking Model

The Booking model represents reservations made by guests for properties.

### Schema

```javascript
{
  property: ObjectId,        // Reference to Property model
  guest: ObjectId,           // Reference to User model (guest)
  host: ObjectId,            // Reference to User model (host)
  checkInDate: Date,         // Check-in date
  checkOutDate: Date,        // Check-out date
  numberOfGuests: Number,    // Number of guests
  totalPrice: Number,        // Total price for the stay
  status: String,            // "pending", "confirmed", "cancelled", "completed"
  paymentStatus: String,     // "pending", "paid", "refunded", "failed"
  paymentId: String,         // Payment reference ID
  specialRequests: String,   // Special requests from guest
  cancellationReason: String,// Reason if cancelled
  cancelledBy: String,       // "guest", "host", "admin", or null
  cancelledAt: Date          // Date of cancellation
}
```

### Indexes

-   Compound index on `property`, `checkInDate`, and `checkOutDate` for availability checks
-   Indexes on `guest` and `host` fields with `status` for efficient booking queries

## Review Model

The Review model represents reviews left by guests for properties they've stayed at.

### Schema

```javascript
{
  property: ObjectId,        // Reference to Property model
  booking: ObjectId,         // Reference to Booking model
  guest: ObjectId,           // Reference to User model
  rating: Number,            // Rating (1-5)
  comment: String,           // Review text
  response: {                // Host's response
    text: String,
    createdAt: Date
  },
  isVisible: Boolean         // Visibility status
}
```

## BlockedDate Model

The BlockedDate model represents dates when a property is unavailable for booking.

### Schema

```javascript
{
  property: ObjectId,        // Reference to Property model
  startDate: Date,           // Start date of blocked period
  endDate: Date,             // End date of blocked period
  reason: String             // Reason for blocking (optional)
}
```

### Indexes

-   Index on `property` and date fields for efficient availability checks
