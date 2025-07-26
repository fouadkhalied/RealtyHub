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

## User Roles
- **USER**: Can create properties and access basic features
- **ADMIN**: Can create customer service accounts and access all features
- **CustomerService**: Administrative access for customer support

---

## API Endpoints

### Authentication

| Method | Endpoint | Security | Parameters | Description |
|--------|----------|----------|------------|-------------|
| `POST` | `/auth/signup/user` | Public | - | Register a new user account |
| `POST` | `/auth/signup/customerService` | Admin | - | Create a customer service account |
| `POST` | `/auth/login` | Public | - | Authenticate user and receive JWT token |

### Properties

| Method | Endpoint | Security | Parameters | Description |
|--------|----------|----------|------------|-------------|
| `POST` | `/properties/create` | User | - | Create a new property listing |
| `GET` | `/properties/:id` | Public | `id` (path) - Property ID | Retrieve a specific property with localized information |
| `GET` | `/properties` | Public | `page` (query, optional) - Page number<br>`limit` (query, optional) - Items per page | Get paginated list of properties |
| `GET` | `/properties/getAvailableProjects` | Public | - | Retrieve list of available projects |
| `GET` | `/properties/getRequiredInterfaces` | Public | - | Retrieve required property interfaces |
| `PATCH` | `/properties/:id/approve` | Admin | `id` (path) - Property ID | Approve a property listing |
| `DELETE` | `/properties/:id/reject` | Admin | `id` (path) - Property ID | Reject/delete a property listing |

### Property Photos

| Method | Endpoint | Security | Parameters | Description |
|--------|----------|----------|------------|-------------|
| `POST` | `/properties/:id/upload/photo` | User | `id` (path) - Property ID<br>`photo` (form-data) - Image file | Upload a photo for a specific property |

**Photo Upload Details:**
- **Content-Type**: `multipart/form-data`
- **File Field**: `photo`
- **Supported Formats**: JPG, PNG, GIF, WebP
- **Max File Size**: 5MB
- **Storage**: Supabase Storage
- **Response**: Returns photo details including public URL

**Example Request:**
```bash
curl -X POST \
  https://your-api.vercel.app/api/properties/27/upload/photo \
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
| `GET` | `/properties/status/counts` | Admin | - | Get count statistics (approved, pending, total) |
| `GET` | `/properties/status/approved` | Admin | - | Retrieve all approved properties |
| `GET` | `/properties/status/pending` | Admin | - | Retrieve all pending properties |

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
- **Authorization**: Users can only upload photos to their own properties

### Database Schema
```sql
-- Property photos table
CREATE TABLE property_photos (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
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
- **403**: Forbidden (Cannot upload to this property)
- **404**: Not Found (Property not found)
- **500**: Internal Server Error (Upload failed, database error)

### Photo Upload Error Examples

```json
// Missing file
{
  "error": "No file uploaded"
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