Real Estate API Documentation
Overview
A comprehensive REST API for managing real estate properties with multi-language support (English/Arabic) and photo upload capabilities, including support for designating a cover image.
Base URLs
# Production
https://express-js-on-vercel-amber-six.vercel.app/api

# Local Development
http://localhost:3000/api

Authentication
The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:
Authorization: Bearer <your-jwt-token>

User Roles & Access Control

USER: Can create properties, upload photos to their own properties, and access basic features.
ADMIN: Has universal access to all endpoints and can create customer service accounts.
CustomerService: Administrative access for customer support.

Note: Admin users have override access to all endpoints, regardless of the specified role requirement.

API Endpoints
Authentication



Method
Endpoint
Security
Parameters
Description



POST
/auth/signup/user
Public
username (body) - Usernameemail (body) - User emailpassword (body) - User password
Register a new user account


POST
/auth/signup/customerService
Admin Only
username (body) - Usernameemail (body) - User emailpassword (body) - User password
Create a customer service account


POST
/auth/login
Public
email (body) - User emailpassword (body) - User password
Authenticate user and receive JWT token


Properties



Method
Endpoint
Security
Parameters
Description



POST
/properties/create
User or Admin
CreatePropertyRequest (body) - Property details
Create a new property listing


GET
/properties/:id
User or Admin
id (path) - Property ID
Retrieve a specific property with localized information


GET
/properties
Public
page (query, optional) - Page numberlimit (query, optional) - Items per page
Get paginated list of properties


GET
/properties/getAvailableProjects
Public
page (query, optional) - Page numberlimit (query, optional) - Items per page
Get paginated list of available projects


GET
/properties/getRequiredInterfaces
Public
-
Retrieve required property interfaces (e.g., property types)


PATCH
/properties/:id/approve
Admin Only
id (path) - Property ID
Approve a property listing


DELETE
/properties/:id/reject
Admin Only
id (path) - Property ID
Reject/delete a property listing


GET
/properties/status/counts
Admin Only
-
Get count statistics (approved, pending, total)


GET
/properties/status/approved
Admin Only
-
Retrieve IDs of all approved properties


GET
/properties/status/pending
Admin Only
-
Retrieve IDs of all pending properties


Property Photos



Method
Endpoint
Security
Parameters
Description



POST
/properties/:id/upload/photo/:coverImageIndex
User or Admin
id (path) - Property IDcoverImageIndex (path) - Index of the cover image in the uploaded filesphoto (form-data) - Array of image files
Upload multiple photos for a specific property, with an optional cover image index


Photo Upload Details:

Content-Type: multipart/form-data
File Field: photo (supports multiple files)
Supported Formats: JPEG, PNG, WebP
Max File Size: 1MB per file
Storage: Supabase Storage
Cover Image: Specify the index of the cover image in the coverImageIndex path parameter (e.g., 0 for the first uploaded file). If not provided or invalid, no cover image is set.
Response: Returns a success message upon successful upload
Access Control: Users can only upload photos to their own properties; Admins can upload to any property

Example Request:
curl -X POST \
  https://express-js-on-vercel-amber-six.vercel.app/api/properties/27/upload/photo/0 \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "photo=@/path/to/image1.jpg" \
  -F "photo=@/path/to/image2.png"

Example Response:
{
  "message": "Photos uploaded successfully"
}

Error Responses:
// No files uploaded
{
  "error": "No files uploaded"
}
// Invalid property ID
{
  "error": "Invalid property ID"
}
// Invalid cover image index
{
  "error": "Invalid coverImageIndex. Must be a number between 0 and 1"
}
// File too large
{
  "error": "File image1.jpg is too large (max 1MB per file)"
}
// Invalid file type
{
  "error": "File image1.gif has invalid type. Only JPEG, PNG, and WebP allowed"
}
// Access denied
{
  "error": "Access denied - cannot upload photo to this property"
}


Security Implementation
Role-Based Access Control
The API implements a hierarchical role system where:

Admin Override: Admin users (role = ADMIN) have universal access to all endpoints.
Role-Specific Access: Non-admin users must have the specific required role (e.g., USER for property creation, ADMIN for approval/rejection).
JWT Validation: All protected endpoints require valid JWT tokens.

Middleware Implementation
// Admin has access to everything, or user has the specific required role
if (decoded.role === UserRole.ADMIN || decoded.role === allowedRole) {
  req.user = decoded;
  return next();
}


Localization Features
The API supports English and Arabic content with automatic localization for:

Property Features (e.g., Pool → حمام سباحة)
Listing Types (e.g., sale/rent → بيع/إيجار)
Property Types (e.g., Villa/Apartment → فيلا/شقة)
Status Values (e.g., active/inactive → نشط/غير نشط)

All property responses include both original and localized versions with _en and _ar suffixes in the additional_information object.

File Upload & Storage
Photo Management

Storage Provider: Supabase Storage
Bucket: propertyphotos
File Naming: property-{propertyId}-{timestamp}.{extension}
Access: Public URLs for uploaded images
Authorization: Users can only upload photos to their own properties; Admins can upload to any property
Cover Image: The cover image is stored in the properties.coverimageurl field, updated when a valid coverImageIndex is provided.

Database Schema
-- Property photos table
CREATE TABLE property_photos (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_property_photos_property_id 
        FOREIGN KEY (property_id) 
        REFERENCES properties(id) 
        ON DELETE CASCADE
);

-- Properties table (relevant fields)
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    coverimageurl TEXT,
    -- other fields
);


Pagination
For /properties and /properties/getAvailableProjects endpoints:

Default: page=1, limit=10
Maximum Limit: 100 items per page
Response: Includes pagination metadata with totalCount and the list of items (properties or projects)

Property Status Workflow
Properties follow this approval workflow:

Created - New property submitted by user (pending approval)
Pending - Awaiting admin review (is_approved = false)
Approved - Admin approved the property (is_approved = true)
Rejected - Admin rejected/deleted the property

Error Handling
Standard HTTP status codes:

200: Success
201: Created
400: Bad Request (e.g., missing file, invalid property ID, invalid cover image index)
401: Unauthorized (e.g., invalid/missing JWT token)
403: Forbidden (e.g., insufficient role permissions, cannot upload to this property)
404: Not Found (e.g., property not found)
500: Internal Server Error (e.g., upload failed, database error)

Authentication Error Examples
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

Photo Upload Error Examples
// Missing files
{
  "error": "No files uploaded"
}
// Invalid property ID
{
  "error": "Invalid property ID"
}
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
  "error": "Upload failed"
}
