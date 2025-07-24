Real Estate API
This is a Node.js Express API for managing user authentication and property-related operations in an Egyptian real estate market application. The API provides endpoints for user signup, login, property creation, and retrieving available projects, with role-based access control.
Table of Contents

Prerequisites
API Endpoints
Authentication
Properties


Authentication Middleware
Error Handling
Dependencies
Running the Application

Prerequisites

Node.js (v16 or higher)
PostgreSQL database
TypeScript (for type safety)
Environment variables for configuration (e.g., database connection, JWT secret)

Install Dependencies:
npm install


Configure Environment Variables:Create a .env file in the root directory and add necessary configurations:
POSTGRES_URL=postgres://default:VqniRQFd3au6@ep-lingering-credit-a4z4l8il-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require
JWT_SECRET=fouad
PORT=3000


Set Up the Database:

Ensure PostgreSQL is running.
Create a database and apply the schema (see provided SQL schema for tables like users, properties, projects, etc.).
Optionally, seed the database with mock data.


Compile and Run:
npm run dev



API Endpoints
Authentication
POST /api/auth/signup/user

Description: Registers a new user with the USER role.
Body:{
  "username": "string",
  "email": "string",
  "password": "string"
}


Response:
201: { message: "User created successfully", result: { userId: number, token: string } }
400: Missing required fields or invalid data
500: Server error



POST /api/auth/signup/customerService

Description: Registers a new user with the CustomerService role (requires ADMIN role authentication).
Headers: Authorization: Bearer <admin_token>
Body:{
  "username": "string",
  "email": "string",
  "password": "string"
}


Response:
201: { message: "User created successfully", result: { userId: number, token: string } }
400: Missing required fields or invalid data
403: Unauthorized (non-admin user)
500: Server error



POST /api/auth/login

Description: Authenticates a user and returns a JWT token.
Body:{
  "email": "string",
  "password": "string"
}


Response:
200: { token: string }
401: Invalid credentials
400: Missing required fields
500: Server error



Properties
POST /api/properties/create

Description: Creates a new property listing (requires USER role authentication).
Headers: Authorization: Bearer <user_token>
Body (example CreatePropertyRequest):{
  "projectId": 8,
  "propertyTypeId": 1,
  "priceAmount": 3500000.00,
  "bedrooms": 3,
  "bathrooms": 2,
  "areaSqm": 150.5,
  "listingType": "sale",
  "coverImageUrl": "https://example.com/images/cairo_gate_apt.jpg",
  "status": "active",
  "available_from": "2025-08-01",
  "titleEn": "Spacious 3-Bedroom Apartment in Cairo Gate",
  "titleAr": "شقة فسيحة بثلاث غرف نوم في كايرو جيت",
  "descriptionEn": "Modern apartment with city views in Sheikh Zayed.",
  "descriptionAr": "شقة حديثة بإطلالات على المدينة في الشيخ زايد",
  "addressEn": "Cairo Gate, Sheikh Zayed, Giza",
  "addressAr": "كايرو جيت، الشيخ زايد، الجيزة"
}


Response:
201: { id: number }
403: Unauthorized (missing or invalid user)
500: Server error



GET /api/properties/getAvailableProjects

Description: Retrieves a list of available projects (requires USER role authentication).
Headers: Authorization: Bearer <user_token>
Response:
201: Array of project objects
403: Unauthorized
500: Server error



Authentication Middleware

The AuthMiddleware ensures that protected endpoints (/api/properties/* and /api/auth/signup/customerService) require a valid JWT token.
For /api/auth/signup/customerService, the middleware checks for the ADMIN role.
For /api/properties/*, the middleware ensures the user has the USER role.

Error Handling

400: Bad request (e.g., missing required fields).
401: Unauthorized (invalid credentials during login).
403: Forbidden (invalid or missing token, or insufficient role permissions).
500: Internal server error (unexpected issues).

Dependencies

express: Web framework for Node.js
body-parser: Middleware for parsing JSON request bodies
Custom modules:
AuthService: Handles signup and login logic
PropertyService: Manages property creation and project retrieval
UserRepositoryImplementation: Interacts with the users table
PropertiesRepositoryImp: Interacts with the properties and projects tables
AuthMiddleware: JWT-based authentication and role-based authorization
CreatePropertyRequest: DTO for property creation
UserRole: Enum for user roles (USER, CustomerService, ADMIN)



Running the Application

Ensure the database is set up and seeded (if needed).
Start the server:npm start


The API will be available at http://localhost:3000 (or the configured PORT).

Notes

The API assumes a PostgreSQL database with tables as defined in the provided schema (e.g., users, properties, projects).
Ensure the listing_type values in the properties table match the database constraint (sale, rent, lease).
JWT tokens are used for authentication; store them securely on the client side.
For production, configure HTTPS and additional security measures.
