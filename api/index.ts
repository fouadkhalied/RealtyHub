import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { AuthMiddleware } from '../src/modules/auth/application/authMiddleware';
import bodyParser from 'body-parser';
import { UserRole } from '../src/modules/user/domain/valueObjects/user-role.vo';

import { createPropertyController } from '../src/modules/properties/composition/createPropertyController';
import { createAuthController } from '../src/modules/auth/composition/createAuthController';
import { createPostController } from '../src/modules/blogs/composition/createPostController';
import { createUserController } from "../src/modules/user/composition/createUserController";

const app = express();
app.use(bodyParser.json());

app.use(cors({
  origin:
     ['http://real-estate-eg.vercel.app',
      'https://real-estate-website-nextjs.vercel.app',
      'https://real-estate-website-nextjs-lovat.vercel.app',
      'http://localhost:3000', 
      'http://localhost:3001', 
      'http://localhost:3003', 
      'http://localhost:3004', 
      'http://localhost:3005'],
      // Local development origins
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1 * 1024 * 1024 // 1MB limit
  }
})

const authController = createAuthController();
const UserController = createUserController();
const propertyController = createPropertyController();
const postController = createPostController();

// All Auth Routes
app.post(
  '/api/auth/signup/user',
  (req, res) => authController.registerUser(req,res)
);

app.post(
  '/api/auth/login',
  (req, res) => authController.login(req,res)
);

app.post(
  '/api/auth/signup/customerService',AuthMiddleware(UserRole.ADMIN),
  (req, res) => authController.registerCustomerService(req,res)
);

// All User Routes

app.post(
  '/api/user/submitContactInfo',AuthMiddleware(UserRole.USER),
  (req,res) => UserController.sendPayloadByEmail(req,res)
)

// All Property Routes
app.post(
  '/api/properties/create',
  AuthMiddleware(UserRole.USER),
  (req, res) => propertyController.createProperty(req, res)
);

app.put(
  '/api/properties/:id/update',
  AuthMiddleware(UserRole.USER),
  (req, res) => propertyController.updateProperty(req, res)
);

app.get(
  '/api/properties/getRequiredInterfaces',
  (req, res) => propertyController.getRequiredInterfaces(req, res)
);

app.get(
  '/api/properties/getAvailableProjects',
  (req, res) => propertyController.getProjects(req, res)
);

app.post(
  '/api/properties/:id/upload/photo/:coverImageIndex',
  AuthMiddleware(UserRole.USER),
  upload.array('photo'),
  (req, res) => propertyController.uploadPhotos(req, res)
);

app.get(
  '/api/properties/projects',
  (req, res) => propertyController.getProjects(req, res)
);

app.get(
  '/api/properties/:id',
  (req, res) => propertyController.getPropertyById(req, res)
);

app.put(
  '/api/properties/:id/approve',
  AuthMiddleware(UserRole.ADMIN),
  (req, res) => propertyController.approveProperty(req, res)
);

app.delete(
  '/api/properties/:id/reject',
  AuthMiddleware(UserRole.ADMIN),
  (req, res) => propertyController.rejectProperty(req, res)
);

app.get(
  '/api/properties/status/counts',
  (req, res) => propertyController.getPropertyStatus(req, res)
);

app.get(
  '/api/properties/status/approved',
  (req, res) => propertyController.getApprovedProperties(req, res)
);

app.get(
  '/api/properties/status/pending',
  (req, res) => propertyController.getPendingProperties(req, res)
);

app.get(
  '/api/properties',
  (req, res) => propertyController.getAllProperties(req, res)
);

// All posts routes

app.post(
  '/api/posts',AuthMiddleware(UserRole.ADMIN),
  (req,res) => postController.createPost(req,res)
)

app.get(
  '/api/posts/:id',
  (req,res)=> postController.getPostById(req,res)
)

app.get(
  '/api/posts/bySlug/:slug',
  (req,res)=> postController.getPostsBySlug(req,res)
)

app.get(
  '/api/posts',
  (req,res)=> postController.getPosts(req,res)
)

app.patch(
  '/api/posts/:id/:part/:language',
  AuthMiddleware(UserRole.ADMIN),
  (req, res) => postController.updatePart(req as any, res)
)

export default app;