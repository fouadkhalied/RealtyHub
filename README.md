# Real Estate API Documentation

## Overview
A comprehensive REST API for managing real estate properties with multi-language support (English/Arabic).

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
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error