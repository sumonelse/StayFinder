# Booking API Endpoints

This document describes the API endpoints for managing bookings in the StayFinder application.

## Base URL

All endpoints are relative to the base URL:

```
/api/bookings
```

## Endpoints

### Get All Bookings

Retrieves a list of bookings for the authenticated user. The response will vary based on the user's role:

-   Regular users: See their own bookings as a guest
-   Hosts: See bookings for their properties
-   Admins: See all bookings

```
GET /
```

#### Query Parameters

| Parameter   | Type   | Description                                                 |
| ----------- | ------ | ----------------------------------------------------------- |
| `page`      | Number | Page number (default: 1)                                    |
| `limit`     | Number | Number of items per page (default: 10, max: 50)             |
| `sort`      | String | Sort field and direction (e.g., `checkInDate:asc`)          |
| `status`    | String | Filter by status (pending, confirmed, cancelled, completed) |
| `property`  | String | Filter by property ID (hosts and admins only)               |
| `startDate` | Date   | Filter by check-in date >= startDate (YYYY-MM-DD)           |
| `endDate`   | Date   | Filter by check-out date <= endDate (YYYY-MM-DD)            |

#### Response

```json
{
    "success": true,
    "count": 5,
    "pagination": {
        "page": 1,
        "limit": 10,
        "totalPages": 1,
        "totalResults": 5
    },
    "data": [
        {
            "_id": "60d21b4667d0d8992e610c95",
            "property": {
                "_id": "60d21b4667d0d8992e610c85",
                "title": "Modern Apartment in Downtown",
                "images": [
                    {
                        "url": "https://example.com/image1.jpg",
                        "caption": "Living Room"
                    }
                ],
                "address": {
                    "city": "New York",
                    "state": "NY",
                    "country": "USA"
                }
            },
            "host": {
                "_id": "60d21b4667d0d8992e610c80",
                "name": "John Doe",
                "profilePicture": "https://example.com/profile.jpg"
            },
            "guest": {
                "_id": "60d21b4667d0d8992e610c81",
                "name": "Jane Smith",
                "profilePicture": "https://example.com/jane.jpg"
            },
            "checkInDate": "2023-07-10T00:00:00.000Z",
            "checkOutDate": "2023-07-15T00:00:00.000Z",
            "numberOfGuests": 2,
            "totalPrice": 600,
            "status": "confirmed",
            "paymentStatus": "paid",
            "createdAt": "2023-06-15T10:00:00.000Z"
        }
        // More bookings...
    ]
}
```

### Get Booking by ID

Retrieves a single booking by its ID. Users can only access their own bookings (as guest or host).

```
GET /:id
```

#### URL Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | String | Booking ID  |

#### Response

```json
{
    "success": true,
    "data": {
        "_id": "60d21b4667d0d8992e610c95",
        "property": {
            "_id": "60d21b4667d0d8992e610c85",
            "title": "Modern Apartment in Downtown",
            "description": "A beautiful modern apartment in the heart of downtown.",
            "type": "apartment",
            "price": 120,
            "pricePeriod": "night",
            "bedrooms": 2,
            "bathrooms": 1,
            "maxGuests": 4,
            "address": {
                "street": "123 Main St",
                "city": "New York",
                "state": "NY",
                "zipCode": "10001",
                "country": "USA"
            },
            "location": {
                "type": "Point",
                "coordinates": [-73.98513, 40.748817]
            },
            "images": [
                {
                    "url": "https://example.com/image1.jpg",
                    "caption": "Living Room"
                }
            ],
            "amenities": ["wifi", "kitchen", "ac", "tv"],
            "rules": {
                "checkIn": "3:00 PM",
                "checkOut": "11:00 AM",
                "smoking": false,
                "pets": false,
                "parties": false,
                "events": false,
                "quietHours": "10:00 PM - 7:00 AM",
                "additionalRules": []
            }
        },
        "host": {
            "_id": "60d21b4667d0d8992e610c80",
            "name": "John Doe",
            "profilePicture": "https://example.com/profile.jpg",
            "phone": "1234567890"
        },
        "guest": {
            "_id": "60d21b4667d0d8992e610c81",
            "name": "Jane Smith",
            "profilePicture": "https://example.com/jane.jpg",
            "phone": "0987654321"
        },
        "checkInDate": "2023-07-10T00:00:00.000Z",
        "checkOutDate": "2023-07-15T00:00:00.000Z",
        "numberOfGuests": 2,
        "totalPrice": 600,
        "status": "confirmed",
        "paymentStatus": "paid",
        "paymentId": "pay_123456789",
        "specialRequests": "Late check-in around 8 PM.",
        "createdAt": "2023-06-15T10:00:00.000Z",
        "updatedAt": "2023-06-15T15:30:00.000Z"
    }
}
```

### Create Booking

Creates a new booking for a property. Requires authentication.

```
POST /
```

#### Request Body

```json
{
    "property": "60d21b4667d0d8992e610c85",
    "checkInDate": "2023-07-10",
    "checkOutDate": "2023-07-15",
    "numberOfGuests": 2,
    "specialRequests": "Late check-in around 8 PM."
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "_id": "60d21b4667d0d8992e610c95",
        "property": "60d21b4667d0d8992e610c85",
        "host": "60d21b4667d0d8992e610c80",
        "guest": "60d21b4667d0d8992e610c81",
        "checkInDate": "2023-07-10T00:00:00.000Z",
        "checkOutDate": "2023-07-15T00:00:00.000Z",
        "numberOfGuests": 2,
        "totalPrice": 600,
        "status": "pending",
        "paymentStatus": "pending",
        "specialRequests": "Late check-in around 8 PM.",
        "createdAt": "2023-06-15T10:00:00.000Z",
        "updatedAt": "2023-06-15T10:00:00.000Z"
    }
}
```

### Update Booking Status

Updates the status of a booking. Different actions are available based on user role:

-   Guests can cancel their bookings
-   Hosts can confirm, cancel, or complete bookings
-   Admins can update any booking status

```
PUT /:id/status
```

#### URL Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | String | Booking ID  |

#### Request Body

```json
{
    "status": "confirmed",
    "message": "Looking forward to hosting you!"
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "_id": "60d21b4667d0d8992e610c95",
        "status": "confirmed",
        "updatedAt": "2023-06-15T15:30:00.000Z"
    }
}
```

### Cancel Booking

Cancels a booking. Guests, hosts, and admins can cancel bookings.

```
PUT /:id/cancel
```

#### URL Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | String | Booking ID  |

#### Request Body

```json
{
    "reason": "Change of plans"
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "_id": "60d21b4667d0d8992e610c95",
        "status": "cancelled",
        "cancellationReason": "Change of plans",
        "cancelledBy": "guest",
        "cancelledAt": "2023-06-16T10:00:00.000Z",
        "updatedAt": "2023-06-16T10:00:00.000Z"
    }
}
```

### Update Payment Status

Updates the payment status of a booking. Typically used by payment webhook or admin.

```
PUT /:id/payment
```

#### URL Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | String | Booking ID  |

#### Request Body

```json
{
    "paymentStatus": "paid",
    "paymentId": "pay_123456789"
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "_id": "60d21b4667d0d8992e610c95",
        "paymentStatus": "paid",
        "paymentId": "pay_123456789",
        "updatedAt": "2023-06-15T16:00:00.000Z"
    }
}
```

### Get Booking Statistics

Retrieves booking statistics for hosts or admins. Requires authentication with host or admin role.

```
GET /stats
```

#### Query Parameters

| Parameter  | Type   | Description                                                    |
| ---------- | ------ | -------------------------------------------------------------- |
| `period`   | String | Time period: "day", "week", "month", "year" (default: "month") |
| `property` | String | Filter by property ID (optional)                               |

#### Response

```json
{
    "success": true,
    "data": {
        "totalBookings": 25,
        "confirmedBookings": 18,
        "pendingBookings": 5,
        "cancelledBookings": 2,
        "totalRevenue": 12500,
        "averageBookingValue": 500,
        "occupancyRate": 75,
        "bookingsByDate": [
            {
                "date": "2023-06-01",
                "count": 3,
                "revenue": 1500
            }
            // More date entries...
        ]
    }
}
```

## Error Responses

### Not Found

```json
{
    "success": false,
    "error": "Not Found",
    "message": "Booking with ID 60d21b4667d0d8992e610c95 not found"
}
```

### Validation Error

```json
{
    "success": false,
    "error": "Validation Error",
    "message": "Please provide all required fields",
    "details": [
        {
            "field": "checkInDate",
            "message": "Check-in date is required"
        }
    ]
}
```

### Availability Error

```json
{
    "success": false,
    "error": "Availability Error",
    "message": "Property is not available for the selected dates"
}
```

### Authorization Error

```json
{
    "success": false,
    "error": "Authorization Error",
    "message": "Not authorized to access this booking"
}
```
