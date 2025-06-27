# Image Upload Functionality

This document provides an overview of the image upload functionality implemented in the StayFinder application.

## Overview

The image upload system uses Cloudinary as the cloud storage provider and includes:

1. Server-side handling of file uploads with Multer and Cloudinary
2. Client-side components for image uploads
3. Support for both single and multiple image uploads
4. Role-based access control for property image uploads

## Server-Side Implementation

### Configuration

1. Set up your Cloudinary credentials in the `.env` file:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### API Endpoints

The following endpoints are available for image uploads:

-   `POST /api/uploads/single` - Upload a single image (authenticated users)
-   `POST /api/uploads/multiple` - Upload multiple images (authenticated users)
-   `POST /api/uploads/property/single` - Upload a single property image (hosts and admins only)
-   `POST /api/uploads/property/multiple` - Upload multiple property images (hosts and admins only)

### Request Format

For single image uploads:

```
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

Form data:
- image: File
- folder: String (optional, defaults to "stayfinder")
```

For multiple image uploads:

```
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

Form data:
- images: File[] (up to 10 files)
- folder: String (optional, defaults to "stayfinder")
```

### Response Format

Successful response for single image upload:

```json
{
    "success": true,
    "data": {
        "url": "https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/stayfinder/image123.jpg",
        "publicId": "stayfinder/image123"
    }
}
```

Successful response for multiple image uploads:

```json
{
    "success": true,
    "data": [
        {
            "url": "https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/stayfinder/image123.jpg",
            "publicId": "stayfinder/image123"
        },
        {
            "url": "https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/stayfinder/image456.jpg",
            "publicId": "stayfinder/image456"
        }
    ]
}
```

## Client-Side Implementation

### Components

1. **ImageUploader**: A reusable component for drag-and-drop image uploads
2. **PropertyImageUploader**: A specialized component for property image uploads
3. **ProfilePictureUploader**: A component for user profile picture uploads

### Hooks

**useImageUpload**: A custom hook that manages the state and logic for image uploads

### Usage Examples

#### Profile Picture Upload

```jsx
import ProfilePictureUploader from "../components/user/ProfilePictureUploader"

function ProfilePage() {
    const authToken = "..." // Get from auth context or state
    const currentUser = { profilePicture: "https://example.com/image.jpg" }

    const handleImageUploaded = (imageUrl) => {
        console.log("New profile picture:", imageUrl)
        // Update user profile with new image URL
    }

    return (
        <div>
            <h1>Your Profile</h1>
            <ProfilePictureUploader
                currentImage={currentUser.profilePicture}
                onImageUploaded={handleImageUploaded}
                token={authToken}
            />
        </div>
    )
}
```

#### Property Images Upload

```jsx
import PropertyImageUploader from "../components/property/PropertyImageUploader"

function CreatePropertyPage() {
    const authToken = "..." // Get from auth context or state

    const handleImagesUploaded = (images) => {
        console.log("Uploaded images:", images)
        // Store these image URLs with the property data
    }

    return (
        <div>
            <h1>Create New Property</h1>
            <PropertyImageUploader
                onImagesUploaded={handleImagesUploaded}
                token={authToken}
            />
        </div>
    )
}
```

## Best Practices

1. Always validate file types and sizes on both client and server
2. Use the appropriate endpoint based on the image type (profile, property, etc.)
3. Handle loading states and errors appropriately
4. Clean up temporary files after upload
5. Implement proper error handling for failed uploads

## Limitations

-   Maximum file size: 5MB per image
-   Maximum number of files per upload: 10
-   Supported file types: Images only (JPEG, PNG, GIF, etc.)
