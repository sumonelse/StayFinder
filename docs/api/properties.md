# Property API Endpoints

This document describes the API endpoints for managing properties in the StayFinder application.

## Base URL

All endpoints are relative to the base URL:

```
/api/properties
```

## Endpoints

### Get All Properties

Retrieves a list of properties with optional filtering, sorting, and pagination.

```
GET /
```

#### Query Parameters

| Parameter     | Type   | Description                                                    |
| ------------- | ------ | -------------------------------------------------------------- |
| `page`        | Number | Page number (default: 1)                                       |
| `limit`       | Number | Number of items per page (default: 10, max: 50)                |
| `sort`        | String | Sort field and direction (e.g., `price:asc`, `createdAt:desc`) |
| `location`    | String | Location to search near (city, state, or country)              |
| `coordinates` | String | Coordinates to search near (format: `lat,lng`)                 |
| `distance`    | Number | Distance in kilometers from coordinates (default: 10)          |
| `minPrice`    | Number | Minimum price                                                  |
| `maxPrice`    | Number | Maximum price                                                  |
| `bedrooms`    | Number | Minimum number of bedrooms                                     |
| `bathrooms`   | Number | Minimum number of bathrooms                                    |
| `guests`      | Number | Minimum number of guests                                       |
| `type`        | String | Property type (apartment, house, etc.)                         |
| `amenities`   | String | Comma-separated list of amenities                              |
| `checkIn`     | Date   | Check-in date (format: YYYY-MM-DD)                             |
| `checkOut`    | Date   | Check-out date (format: YYYY-MM-DD)                            |
| `query`       | String | Search query for property title, description, or location      |

#### Response

```json
{
    "success": true,
    "count": 50,
    "pagination": {
        "page": 1,
        "limit": 10,
        "totalPages": 5,
        "totalResults": 50
    },
    "data": [
        {
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
            "amenities": ["wifi", "kitchen", "ac", "tv"],
            "images": [
                {
                    "url": "https://example.com/image1.jpg",
                    "caption": "Living Room"
                }
            ],
            "host": {
                "_id": "60d21b4667d0d8992e610c80",
                "name": "John Doe",
                "profilePicture": "https://example.com/profile.jpg"
            },
            "isAvailable": true,
            "isApproved": true,
            "avgRating": 4.5,
            "reviewCount": 10,
            "createdAt": "2023-06-01T12:00:00.000Z",
            "updatedAt": "2023-06-10T15:30:00.000Z"
        }
        // More properties...
    ]
}
```

### Get Featured Properties

Retrieves a list of featured properties.

```
GET /featured
```

#### Query Parameters

| Parameter | Type   | Description                                     |
| --------- | ------ | ----------------------------------------------- |
| `limit`   | Number | Number of items to return (default: 6, max: 20) |

#### Response

```json
{
    "success": true,
    "count": 6,
    "data": [
        // Property objects...
    ]
}
```

### Get Property by ID

Retrieves a single property by its ID.

```
GET /:id
```

#### URL Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | String | Property ID |

#### Response

```json
{
    "success": true,
    "data": {
        // Property object with full details
    }
}
```

### Create Property

Creates a new property listing. Requires authentication with host role.

```
POST /
```

#### Request Body

```json
{
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
        "coordinates": [-73.98513, 40.748817]
    },
    "amenities": ["wifi", "kitchen", "ac", "tv"],
    "images": [
        {
            "url": "https://example.com/image1.jpg",
            "caption": "Living Room"
        }
    ],
    "rules": {
        "checkIn": "3:00 PM",
        "checkOut": "11:00 AM",
        "smoking": false,
        "pets": false,
        "parties": false,
        "events": false,
        "quietHours": "10:00 PM - 7:00 AM",
        "additionalRules": ["No shoes in the house"]
    }
}
```

#### Response

```json
{
    "success": true,
    "data": {
        // Created property object
    }
}
```

### Update Property

Updates an existing property. Requires authentication with host role and ownership of the property.

```
PUT /:id
```

#### URL Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | String | Property ID |

#### Request Body

Same as the create property request body, but all fields are optional.

#### Response

```json
{
    "success": true,
    "data": {
        // Updated property object
    }
}
```

### Delete Property

Deletes a property. Requires authentication with host role and ownership of the property.

```
DELETE /:id
```

#### URL Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | String | Property ID |

#### Response

```json
{
    "success": true,
    "data": {}
}
```

### Get Property Availability

Retrieves the availability of a property for a given date range.

```
GET /:id/availability
```

#### URL Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | String | Property ID |

#### Query Parameters

| Parameter   | Type | Description                     |
| ----------- | ---- | ------------------------------- |
| `startDate` | Date | Start date (format: YYYY-MM-DD) |
| `endDate`   | Date | End date (format: YYYY-MM-DD)   |

#### Response

```json
{
    "success": true,
    "data": {
        "available": true,
        "blockedDates": [
            {
                "startDate": "2023-07-10T00:00:00.000Z",
                "endDate": "2023-07-15T00:00:00.000Z",
                "reason": "Booking"
            }
        ]
    }
}
```

### Block Property Dates

Blocks dates for a property. Requires authentication with host role and ownership of the property.

```
POST /:id/block-dates
```

#### URL Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | String | Property ID |

#### Request Body

```json
{
    "startDate": "2023-07-20",
    "endDate": "2023-07-25",
    "reason": "Maintenance"
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "_id": "60d21b4667d0d8992e610c90",
        "property": "60d21b4667d0d8992e610c85",
        "startDate": "2023-07-20T00:00:00.000Z",
        "endDate": "2023-07-25T00:00:00.000Z",
        "reason": "Maintenance"
    }
}
```

### Unblock Property Dates

Unblocks dates for a property. Requires authentication with host role and ownership of the property.

```
DELETE /:id/block-dates/:blockId
```

#### URL Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | String | Property ID |
| `blockId` | String | Block ID    |

#### Response

```json
{
    "success": true,
    "data": {}
}
```

### Get Property Reviews

Retrieves reviews for a property.

```
GET /:id/reviews
```

#### URL Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | String | Property ID |

#### Query Parameters

| Parameter | Type   | Description                                       |
| --------- | ------ | ------------------------------------------------- |
| `page`    | Number | Page number (default: 1)                          |
| `limit`   | Number | Number of items per page (default: 10, max: 50)   |
| `sort`    | String | Sort field and direction (e.g., `createdAt:desc`) |

#### Response

```json
{
    "success": true,
    "count": 10,
    "pagination": {
        "page": 1,
        "limit": 10,
        "totalPages": 1,
        "totalResults": 10
    },
    "data": [
        {
            "_id": "60d21b4667d0d8992e610c95",
            "property": "60d21b4667d0d8992e610c85",
            "guest": {
                "_id": "60d21b4667d0d8992e610c81",
                "name": "Jane Smith",
                "profilePicture": "https://example.com/jane.jpg"
            },
            "rating": 5,
            "comment": "Great place to stay! Very clean and comfortable.",
            "createdAt": "2023-06-15T10:00:00.000Z"
        }
        // More reviews...
    ]
}
```

## Error Responses

### Not Found

```json
{
    "success": false,
    "error": "Resource not found",
    "message": "Property with ID 60d21b4667d0d8992e610c85 not found"
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
            "field": "title",
            "message": "Title is required"
        }
    ]
}
```

### Authentication Error

```json
{
    "success": false,
    "error": "Authentication Error",
    "message": "Not authorized to access this resource"
}
```
