# Authentication API Endpoints

This document describes the API endpoints for authentication in the StayFinder application.

## Base URL

All endpoints are relative to the base URL:

```
/api/auth
```

## Endpoints

### Register

Registers a new user.

```
POST /register
```

#### Request Body

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890"
}
```

#### Response

```json
{
    "success": true,
    "message": "Registration successful. Please check your email for verification.",
    "data": {
        "user": {
            "_id": "60d21b4667d0d8992e610c80",
            "name": "John Doe",
            "email": "john@example.com",
            "role": "user",
            "isVerified": false,
            "createdAt": "2023-06-01T12:00:00.000Z"
        }
    }
}
```

### Login

Authenticates a user and returns a JWT token.

```
POST /login
```

#### Request Body

```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

#### Response

```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "_id": "60d21b4667d0d8992e610c80",
            "name": "John Doe",
            "email": "john@example.com",
            "role": "user",
            "isVerified": true,
            "profilePicture": "https://example.com/profile.jpg",
            "createdAt": "2023-06-01T12:00:00.000Z"
        }
    }
}
```

### Verify Email

Verifies a user's email address using a verification token.

```
GET /verify-email/:token
```

#### URL Parameters

| Parameter | Type   | Description              |
| --------- | ------ | ------------------------ |
| `token`   | String | Email verification token |

#### Response

```json
{
    "success": true,
    "message": "Email verified successfully. You can now log in."
}
```

### Forgot Password

Sends a password reset email to the user.

```
POST /forgot-password
```

#### Request Body

```json
{
    "email": "john@example.com"
}
```

#### Response

```json
{
    "success": true,
    "message": "Password reset email sent. Please check your email."
}
```

### Reset Password

Resets a user's password using a reset token.

```
POST /reset-password/:token
```

#### URL Parameters

| Parameter | Type   | Description          |
| --------- | ------ | -------------------- |
| `token`   | String | Password reset token |

#### Request Body

```json
{
    "password": "newpassword123"
}
```

#### Response

```json
{
    "success": true,
    "message": "Password reset successful. You can now log in with your new password."
}
```

### Get Current User

Retrieves the currently authenticated user. Requires authentication.

```
GET /me
```

#### Response

```json
{
    "success": true,
    "data": {
        "user": {
            "_id": "60d21b4667d0d8992e610c80",
            "name": "John Doe",
            "email": "john@example.com",
            "role": "user",
            "isVerified": true,
            "profilePicture": "https://example.com/profile.jpg",
            "phone": "1234567890",
            "bio": "I love traveling and exploring new places.",
            "createdAt": "2023-06-01T12:00:00.000Z",
            "updatedAt": "2023-06-10T15:30:00.000Z"
        }
    }
}
```

### Update Profile

Updates the current user's profile. Requires authentication.

```
PUT /me
```

#### Request Body

```json
{
    "name": "John Smith",
    "phone": "0987654321",
    "bio": "Updated bio information"
}
```

#### Response

```json
{
    "success": true,
    "message": "Profile updated successfully",
    "data": {
        "user": {
            "_id": "60d21b4667d0d8992e610c80",
            "name": "John Smith",
            "email": "john@example.com",
            "role": "user",
            "isVerified": true,
            "profilePicture": "https://example.com/profile.jpg",
            "phone": "0987654321",
            "bio": "Updated bio information",
            "createdAt": "2023-06-01T12:00:00.000Z",
            "updatedAt": "2023-06-15T10:00:00.000Z"
        }
    }
}
```

### Change Password

Changes the current user's password. Requires authentication.

```
PUT /change-password
```

#### Request Body

```json
{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
}
```

#### Response

```json
{
    "success": true,
    "message": "Password changed successfully"
}
```

### Upload Profile Picture

Uploads a profile picture for the current user. Requires authentication.

```
POST /profile-picture
```

#### Request Body

Multipart form data with a file field named `profilePicture`.

#### Response

```json
{
    "success": true,
    "message": "Profile picture uploaded successfully",
    "data": {
        "profilePicture": "https://example.com/new-profile.jpg"
    }
}
```

### Become Host

Requests to become a host. Requires authentication.

```
POST /become-host
```

#### Request Body

```json
{
    "phone": "1234567890",
    "bio": "I have several properties available for rent."
}
```

#### Response

```json
{
    "success": true,
    "message": "Host status granted successfully",
    "data": {
        "user": {
            "_id": "60d21b4667d0d8992e610c80",
            "name": "John Doe",
            "email": "john@example.com",
            "role": "host",
            "isVerified": true,
            "profilePicture": "https://example.com/profile.jpg",
            "phone": "1234567890",
            "bio": "I have several properties available for rent.",
            "createdAt": "2023-06-01T12:00:00.000Z",
            "updatedAt": "2023-06-20T14:00:00.000Z"
        }
    }
}
```

### Logout

Invalidates the current user's token. Requires authentication.

```
POST /logout
```

#### Response

```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

## Error Responses

### Validation Error

```json
{
    "success": false,
    "error": "Validation Error",
    "message": "Please provide all required fields",
    "details": [
        {
            "field": "email",
            "message": "Please enter a valid email address"
        },
        {
            "field": "password",
            "message": "Password must be at least 8 characters long"
        }
    ]
}
```

### Authentication Error

```json
{
    "success": false,
    "error": "Authentication Error",
    "message": "Invalid credentials"
}
```

### Not Found

```json
{
    "success": false,
    "error": "Not Found",
    "message": "User not found"
}
```

### Unauthorized

```json
{
    "success": false,
    "error": "Unauthorized",
    "message": "Not authorized to access this resource"
}
```
