# Real Estate API Documentation

## Overview
A comprehensive REST API for managing real estate properties with multi-language support (English/Arabic) and photo upload capabilities.

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
| `GET` | `/properties/:id` | **User or Admin** | `id` (path) - Property ID | Retrieve a specific property with localized information |
| `GET` | `/properties` | Public | `page` (query, optional) - Page number<br>`limit` (query, optional) - Items per page | Get paginated list of properties |
| `GET` | `/properties/getAvailableProjects` | Public | `page` (query, optional) - Page number<br>`limit` (query, optional) - Items per page | Get paginated list of available Projects |
| `GET` | `/properties/getRequiredInterfaces` | Public | - | Retrieve required property interfaces |
| `PATCH` | `/properties/:id/approve` | **Admin Only** | `id` (path) - Property ID | Approve a property listing |
| `DELETE` | `/properties/:id/reject` | **Admin Only** | `id` (path) - Property ID | Reject/delete a property listing |

### Property Photos

| Method | Endpoint | Security | Parameters | Description |
|--------|----------|----------|------------|-------------|
| `POST` | `/properties/:id/upload/photo/:coverImageIndex` | **User or Admin** | `id` (path) - coverImageIndex (path) - Property ID<br>`photo` (form-data) - Image file | Upload a photo for a specific property |

**Photo Upload Details:**
- **Content-Type**: `multipart/form-data`
- **File Field**: `photo`
- **Supported Formats**: JPG, PNG, GIF, WebP
- **Max File Size**: 5MB
- **Storage**: Supabase Storage
- **Response**: Returns photo details including public URL
- **Access Control**: Users can only upload photos to their own properties; Admins can upload to any property

**Example Request:**
```bash
curl -X POST \
  https://express-js-on-vercel-amber-six.vercel.app/api/properties/27/upload/photo \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "photo=@/path/to/image.jpg"
```

**Example Response:**
```json
{
  "message": "Photo uploaded successfully",
  "photo": {
    "id": 1,
    "fileName": "property-27-1753570258164.png",
    "url": "https://iyufacxknugsdotvqylk.supabase.co/storage/v1/object/public/propertyphotos/property-27-1753570258164.png",
    "size": 581553
  }
}
```

### Property Status Management

| Method | Endpoint | Security | Parameters | Description |
|--------|----------|----------|------------|-------------|
| `GET` | `/properties/status/counts` | **Admin Only** | - | Get count statistics (approved, pending, total) |
| `GET` | `/properties/status/approved` | **Admin Only** | - | Retrieve all approved properties |
| `GET` | `/properties/status/pending` | **Admin Only** | - | Retrieve all pending properties |

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

For `/properties` endpoint:
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

Standard HTTP status codes:
- **200**: Success
- **201**: Created  
- **400**: Bad Request (Missing file, invalid property ID)
- **401**: Unauthorized (Invalid/missing JWT token)
- **403**: Forbidden (Insufficient role permissions, cannot upload to this property)
- **404**: Not Found (Property not found)
- **500**: Internal Server Error (Upload failed, database error)

### Authentication Error Examples

```json
// Missing token
{
  "message": "Authentication token is required."
}

// Invalid token
{
  "message": "Invalid or expired token"
}

// Insufficient permissions
{
  "message": "Unauthorized role"
}
```

### Photo Upload Error Examples

```json
// Invalid cover image index
{
  "error": "Invalid coverImageIndex. Must be a number between 0 and <number-of-files - 1>"
} 

// File too large
{
  "error": "File <filename> is too large (max 1MB per file)"
}

// Invalid file type
{
  "error": "File <filename> has invalid type. Only JPEG, PNG, and WebP allowed"
}

// Access denied
{
  "error": "Access denied - cannot upload photo to this property"
}

// Storage error
{
  "error": "Storage upload failed: Bucket not found"
}
```
