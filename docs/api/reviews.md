# Review API Endpoints

This document describes the API endpoints for managing reviews in the StayFinder application.

## Base URL

All endpoints are relative to the base URL:

```
/api/reviews
```

## Endpoints

### Get All Reviews

Retrieves a list of reviews with optional filtering, sorting, and pagination.

```
GET /
```

#### Query Parameters

| Parameter  | Type   | Description                                       |
| ---------- | ------ | ------------------------------------------------- |
| `page`     | Number | Page number (default: 1)                          |
| `limit`    | Number | Number of items per page (default: 10, max: 50)   |
| `sort`     | String | Sort field and direction (e.g., `createdAt:desc`) |
| `property` | String | Filter by property ID                             |
| `guest`    | String | Filter by guest ID (admin only)                   |
| `rating`   | Number | Filter by minimum rating (1-5)                    |

#### Response

```json
{
    "success": true,
    "count": 15,
    "pagination": {
        "page": 1,
        "limit": 10,
        "totalPages": 2,
        "totalResults": 15
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
                ]
            },
            "guest": {
                "_id": "60d21b4667d0d8992e610c81",
                "name": "Jane Smith",
                "profilePicture": "https://example.com/jane.jpg"
            },
            "rating": 5,
            "comment": "Great place to stay! Very clean and comfortable.",
            "response": {
                "text": "Thank you for your kind review! We're glad you enjoyed your stay.",
                "createdAt": "2023-06-16T10:00:00.000Z"
            },
            "isVisible": true,
            "createdAt": "2023-06-15T10:00:00.000Z"
        }
        // More reviews...
    ]
}
```

### Get Review by ID

Retrieves a single review by its ID.

```
GET /:id
```

#### URL Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | String | Review ID   |

#### Response

```json
{
    "success": true,
    "data": {
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
            "host": {
                "_id": "60d21b4667d0d8992e610c80",
                "name": "John Doe"
            }
        },
        "booking": {
            "_id": "60d21b4667d0d8992e610c90",
            "checkInDate": "2023-05-10T00:00:00.000Z",
            "checkOutDate": "2023-05-15T00:00:00.000Z"
        },
        "guest": {
            "_id": "60d21b4667d0d8992e610c81",
            "name": "Jane Smith",
            "profilePicture": "https://example.com/jane.jpg"
        },
        "rating": 5,
        "comment": "Great place to stay! Very clean and comfortable.",
        "response": {
            "text": "Thank you for your kind review! We're glad you enjoyed your stay.",
            "createdAt": "2023-06-16T10:00:00.000Z"
        },
        "isVisible": true,
        "createdAt": "2023-06-15T10:00:00.000Z",
        "updatedAt": "2023-06-16T10:00:00.000Z"
    }
}
```

### Get Reviews by Property

Retrieves reviews for a specific property.

```
GET /property/:propertyId
```

#### URL Parameters

| Parameter    | Type   | Description |
| ------------ | ------ | ----------- |
| `propertyId` | String | Property ID |

#### Query Parameters

| Parameter | Type   | Description                                       |
| --------- | ------ | ------------------------------------------------- |
| `page`    | Number | Page number (default: 1)                          |
| `limit`   | Number | Number of items per page (default: 10, max: 50)   |
| `sort`    | String | Sort field and direction (e.g., `createdAt:desc`) |
| `rating`  | Number | Filter by minimum rating (1-5)                    |

#### Response

```json
{
    "success": true,
    "count": 8,
    "pagination": {
        "page": 1,
        "limit": 10,
        "totalPages": 1,
        "totalResults": 8
    },
    "data": [
        // Review objects...
    ]
}
```

### Get Reviews by User

Retrieves reviews written by the authenticated user.

```
GET /my-reviews
```

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
    "count": 5,
    "pagination": {
        "page": 1,
        "limit": 10,
        "totalPages": 1,
        "totalResults": 5
    },
    "data": [
        // Review objects...
    ]
}
```

### Create Review

Creates a new review for a property. Requires authentication and a completed booking for the property.

```
POST /
```

#### Request Body

```json
{
    "property": "60d21b4667d0d8992e610c85",
    "booking": "60d21b4667d0d8992e610c90",
    "rating": 5,
    "comment": "Great place to stay! Very clean and comfortable."
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "_id": "60d21b4667d0d8992e610c95",
        "property": "60d21b4667d0d8992e610c85",
        "booking": "60d21b4667d0d8992e610c90",
        "guest": "60d21b4667d0d8992e610c81",
        "rating": 5,
        "comment": "Great place to stay! Very clean and comfortable.",
        "isVisible": true,
        "createdAt": "2023-06-15T10:00:00.000Z",
        "updatedAt": "2023-06-15T10:00:00.000Z"
    }
}
```

### Update Review

Updates an existing review. Users can only update their own reviews.

```
PUT /:id
```

#### URL Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | String | Review ID   |

#### Request Body

```json
{
    "rating": 4,
    "comment": "Updated review comment."
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "_id": "60d21b4667d0d8992e610c95",
        "rating": 4,
        "comment": "Updated review comment.",
        "updatedAt": "2023-06-16T15:00:00.000Z"
    }
}
```

### Delete Review

Deletes a review. Users can only delete their own reviews.

```
DELETE /:id
```

#### URL Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | String | Review ID   |

#### Response

```json
{
    "success": true,
    "data": {}
}
```

### Add Response to Review

Adds a host response to a review. Only the property host can add a response.

```
POST /:id/response
```

#### URL Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | String | Review ID   |

#### Request Body

```json
{
    "text": "Thank you for your kind review! We're glad you enjoyed your stay."
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "_id": "60d21b4667d0d8992e610c95",
        "response": {
            "text": "Thank you for your kind review! We're glad you enjoyed your stay.",
            "createdAt": "2023-06-16T10:00:00.000Z"
        },
        "updatedAt": "2023-06-16T10:00:00.000Z"
    }
}
```

### Update Response to Review

Updates a host response to a review. Only the property host can update the response.

```
PUT /:id/response
```

#### URL Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | String | Review ID   |

#### Request Body

```json
{
    "text": "Updated response text."
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "_id": "60d21b4667d0d8992e610c95",
        "response": {
            "text": "Updated response text.",
            "createdAt": "2023-06-16T10:00:00.000Z"
        },
        "updatedAt": "2023-06-17T10:00:00.000Z"
    }
}
```

### Delete Response to Review

Deletes a host response to a review. Only the property host can delete the response.

```
DELETE /:id/response
```

#### URL Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | String | Review ID   |

#### Response

```json
{
    "success": true,
    "data": {
        "_id": "60d21b4667d0d8992e610c95",
        "response": null,
        "updatedAt": "2023-06-17T15:00:00.000Z"
    }
}
```

### Get Review Statistics

Retrieves review statistics for a property.

```
GET /stats/:propertyId
```

#### URL Parameters

| Parameter    | Type   | Description |
| ------------ | ------ | ----------- |
| `propertyId` | String | Property ID |

#### Response

```json
{
    "success": true,
    "data": {
        "averageRating": 4.5,
        "totalReviews": 8,
        "ratingDistribution": {
            "5": 5,
            "4": 2,
            "3": 1,
            "2": 0,
            "1": 0
        },
        "latestReviews": [
            // Up to 3 latest review objects
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
    "message": "Review with ID 60d21b4667d0d8992e610c95 not found"
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
            "field": "rating",
            "message": "Rating must be between 1 and 5"
        }
    ]
}
```

### Authorization Error

```json
{
    "success": false,
    "error": "Authorization Error",
    "message": "You can only review properties you have stayed at"
}
```
