# Real Estate & Blog API Documentation

## Overview
A comprehensive REST API for managing real estate properties and blog posts with multi-language support (English/Arabic) and photo upload capabilities.

## Base URLs
```
# Production
https://express-js-on-vercel-amber-six.vercel.app/api

# Local Development
http://localhost:3000/api
```

## Authentication
The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## User Roles & Access Control
- **USER**: Can create properties and access basic features
- **ADMIN**: Has universal access to all endpoints and can create customer service accounts
- **CustomerService**: Administrative access for customer support

**Note**: Admin users have override access to all endpoints, regardless of the specified role requirement.

---

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "message": "Request successful",
  "data": {
    // Response data here
  }
}
```

### Paginated Success Response
```json
{
  "success": true,
  "message": "Request successful",
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "message": "Detailed error message",
    "details": {
      "httpStatus": 400,
      // Additional error details
    }
  }
}
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Security | Parameters | Description |
|--------|----------|----------|------------|-------------|
| `POST` | `/auth/signup/user` | Public | - | Register a new user account |
| `POST` | `/auth/signup/customerService` | **Admin Only** | - | Create a customer service account |
| `POST` | `/auth/login` | Public | - | Authenticate user and receive JWT token |

### Properties

| Method | Endpoint | Security | Parameters | Description |
|--------|----------|----------|------------|-------------|
| `POST` | `/properties/create` | **User or Admin** | - | Create a new property listing |
| `PUT` | `/properties/:id/update` | **User or Admin** | `id` (path) - Property ID | Update an existing property listing |
| `GET` | `/properties/:id` | Public | `id` (path) - Property ID | Retrieve a specific property with localized information |
| `GET` | `/properties` | Public | `page` (query, optional) - Page number<br>`limit` (query, optional) - Items per page | Get paginated list of properties |
| `GET` | `/properties/getAvailableProjects` | Public | `page` (query, optional) - Page number<br>`limit` (query, optional) - Items per page | Get paginated list of available Projects |
| `GET` | `/properties/projects` | Public | `page` (query, optional) - Page number<br>`limit` (query, optional) - Items per page | Get paginated list of projects |
| `GET` | `/properties/getRequiredInterfaces` | Public | - | Retrieve required property interfaces |
| `PUT` | `/properties/:id/approve` | **Admin Only** | `id` (path) - Property ID | Approve a property listing |
| `DELETE` | `/properties/:id/reject` | **Admin Only** | `id` (path) - Property ID | Reject/delete a property listing |

### Property Photos

| Method | Endpoint | Security | Parameters | Description |
|--------|----------|----------|------------|-------------|
| `POST` | `/properties/:id/upload/photo/:coverImageIndex` | **User or Admin** | `id` (path) - Property ID<br>`coverImageIndex` (path) - Image index<br>`photo` (form-data) - Image files | Upload photos for a specific property |

**Photo Upload Details:**
- **Content-Type**: `multipart/form-data`
- **File Field**: `photo` (supports multiple files)
- **Supported Formats**: JPG, PNG, GIF, WebP
- **Max File Size**: 1MB per file
- **Storage**: Supabase Storage
- **Response**: Returns photo details including public URL
- **Access Control**: Users can only upload photos to their own properties; Admins can upload to any property

**Example Request:**
```bash
curl -X POST \
  https://express-js-on-vercel-amber-six.vercel.app/api/properties/27/upload/photo/0 \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "photo=@/path/to/image1.jpg" \
  -F "photo=@/path/to/image2.jpg"
```

**Example Success Response:**
```json
{
  "success": true,
  "message": "Photos uploaded successfully",
  "data": {
    "photos": [
      {
        "id": 1,
        "fileName": "property-27-1753570258164.png",
        "url": "https://iyufacxknugsdotvqylk.supabase.co/storage/v1/object/public/propertyphotos/property-27-1753570258164.png",
        "size": 581553
      }
    ]
  }
}
```

### Property Status Management

| Method | Endpoint | Security | Parameters | Description |
|--------|----------|----------|------------|-------------|
| `GET` | `/properties/status/counts` | Public | - | Get count statistics (approved, pending, total) |
| `GET` | `/properties/status/approved` | Public | - | Retrieve all approved properties |
| `GET` | `/properties/status/pending` | Public | - | Retrieve all pending properties |

### Blog Posts

| Method | Endpoint | Security | Parameters | Description |
|--------|----------|----------|------------|-------------|
| `POST` | `/posts` | **Admin Only** | - | Create a new blog post |
| `GET` | `/posts/:id` | Public | `id` (path) - Post ID | Retrieve a specific post by ID |
| `GET` | `/posts/bySlug/:slug` | Public | `slug` (path) - Post slug | Search posts by slug (partial matching) |
| `GET` | `/posts` | Public | `page` (query, optional) - Page number<br>`limit` (query, optional) - Items per page<br>`search` (query, optional) - Search term | Get paginated list of posts with optional search |

**Blog Search Features:**
- Search across post titles, slugs, summaries, categories, and tags
- Case-insensitive partial matching
- Results ordered by relevance and recency
- Supports pagination

---

## Security Implementation

### Role-Based Access Control
The API implements a hierarchical role system where:

1. **Admin Override**: Admin users (role = 2) have universal access to all endpoints
2. **Role-Specific Access**: Non-admin users must have the specific required role
3. **JWT Validation**: All protected endpoints require valid JWT tokens

### Middleware Implementation
```typescript
// Admin has access to everything, or user has the specific required role
if (decoded.role === UserRole.ADMIN || decoded.role === allowedRole) {
  req.user = decoded;
  return next();
}
```

---

## Localization Features

The API supports English and Arabic content with automatic localization for:
- Property Features (Pool → حمام سباحة)
- Listing Types (sale/rent → بيع/إيجار)  
- Property Types (Villa/Apartment → فيلا/شقة)
- Status Values (active/inactive → نشط/غير نشط)

All property responses include both original and localized versions with `_en` and `_ar` suffixes.

---

## File Upload & Storage

### Photo Management
- **Storage Provider**: Supabase Storage
- **Bucket**: `photos`
- **File Naming**: `property-{propertyId}-{timestamp}.{extension}`
- **Access**: Public URLs for uploaded images
- **Authorization**: Users can only upload photos to their own properties; Admins can upload to any property

### Database Schema
```sql
-- Property photos table
CREATE TABLE property_photos (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL,
    url TEXT NOT NULL
    
    CONSTRAINT fk_property_photos_property_id 
        FOREIGN KEY (property_id) 
        REFERENCES properties(id) 
        ON DELETE CASCADE
);
```

---

## Pagination

For paginated endpoints (`/properties`, `/posts`, etc.):
- Default: `page=1`, `limit=10`
- Maximum limit: 100 items per page
- Response includes pagination metadata with `hasNext` and `hasPrevious` flags

## Property Status Workflow

Properties follow this approval workflow:
1. **Created** - New property submitted by user (pending approval)
2. **Pending** - Awaiting admin review (`is_approved = false`)
3. **Approved** - Admin approved the property (`is_approved = true`)
4. **Rejected** - Admin rejected/deleted the property

## Error Handling

Standard HTTP status codes with standardized response format:
- **200**: Success
- **201**: Created  
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

### Authentication Error Examples

```json
// Missing token
{
  "success": false,
  "message": "Authentication token is required",
  "error": {
    "code": "AUTH_TOKEN_REQUIRED",
    "message": "Authentication token is required",
    "details": {
      "httpStatus": 401
    }
  }
}

// Invalid token
{
  "success": false,
  "message": "Invalid or expired token",
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired token",
    "details": {
      "httpStatus": 401
    }
  }
}

// Insufficient permissions
{
  "success": false,
  "message": "Unauthorized role",
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Unauthorized role",
    "details": {
      "httpStatus": 403
    }
  }
}
```

### Photo Upload Error Examples

```json
// Invalid cover image index
{
  "success": false,
  "message": "Invalid coverImageIndex",
  "error": {
    "code": "INVALID_COVER_IMAGE_INDEX",
    "message": "Invalid coverImageIndex. Must be a number between 0 and 4",
    "details": {
      "httpStatus": 400,
      "validRange": "0-4"
    }
  }
}

// File too large
{
  "success": false,
  "message": "File size limit exceeded",
  "error": {
    "code": "FILE_SIZE_LIMIT_EXCEEDED",
    "message": "File image.jpg is too large (max 1MB per file)",
    "details": {
      "httpStatus": 400,
      "maxSize": "1MB",
      "fileName": "image.jpg"
    }
  }
}

// Invalid file type
{
  "success": false,
  "message": "Invalid file type",
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "File image.bmp has invalid type. Only JPEG, PNG, and WebP allowed",
    "details": {
      "httpStatus": 400,
      "allowedTypes": ["JPEG", "PNG", "WebP"],
      "fileName": "image.bmp"
    }
  }
}

// Access denied
{
  "success": false,
  "message": "Access denied",
  "error": {
    "code": "ACCESS_DENIED",
    "message": "Access denied - cannot upload photo to this property",
    "details": {
      "httpStatus": 403,
      "propertyId": 27
    }
  }
}
```

### Blog Post Error Examples

```json
// Post not found
{
  "success": false,
  "message": "Post not found",
  "error": {
    "code": "POST_NOT_FOUND",
    "message": "Post with ID 123 not found",
    "details": {
      "httpStatus": 404,
      "postId": 123
    }
  }
}

// Validation error
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": {
      "httpStatus": 400,
      "field": "title"
    }
  }
}
```

---

## CORS Configuration

The API accepts requests from:
- `http://real-estate-eg.vercel.app`
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:3003`
- `http://localhost:3004`
- `http://localhost:3005`

Supported methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`
Allowed headers: `Content-Type`, `Authorization`
Credentials: Enabled