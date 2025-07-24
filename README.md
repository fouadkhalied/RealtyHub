# Real Estate API Documentation

## Overview
A comprehensive REST API for managing real estate properties with multi-language support (English/Arabic).

## Base URL
```
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
| `GET` | `/properties/getPropertyTypes` | Public | - | Retrieve available property types |

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

## Error Handling

Standard HTTP status codes:
- **200**: Success
- **201**: Created  
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error