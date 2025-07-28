import express from 'express';
import bodyParser from 'body-parser';
import { AuthService } from '../src/modules/auth/services/AuthService';
import { UserRepositoryImplementation } from '../src/modules/user/infrastructure/UserRepositoryImplementation';
import { AuthMiddleware } from '../src/modules/auth/application/authMiddleware';
import { UserRole} from '../src/modules/user/domain/valueObjects/user-role.vo';
import { CreatePropertyRequest} from '../src/modules/properties/prestentaion/dto/CreatePropertyRequest.dto';
import {AuthenticatedRequest} from '../src/modules/auth/application/authMiddleware';
import { PropertyService} from '../src/modules/properties/application/properties.service';
import { PropertiesRepositoryImplementation} from '../src/modules/properties/infrastructure/PropertyRepositoryImp';
import cors from 'cors';
import multer from 'multer';

const app = express()
app.use(bodyParser.json());

app.use(cors({
  origin:
     ['http://real-estate-eg.vercel.app','http://localhost:3000', 'http://localhost:3001' , 'http://localhost:3003' , 'http://localhost:3004' , 'http://localhost:3005'], // Local development origins
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

const authService = new AuthService(new UserRepositoryImplementation());
const propertyService = new PropertyService(new PropertiesRepositoryImplementation());

app.post('/api/auth/signup/user' , async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'username, email, and password are required.' });
  }
  try {
    const result = await authService.signup(UserRole.USER , username, email, password);    

    if (result.token) res.status(201).json({ message: 'User created successfully', result });
    else res.status(400).json({ message: result.message });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', details: (error as Error).message });
  }
});

app.post('/api/auth/signup/customerService',AuthMiddleware(UserRole.ADMIN) , async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'username, email, and password are required.' });
  }
  try {
    const result = await authService.signup(UserRole.CustomerService , username, email, password);

    if (result.token) res.status(201).json({ message: 'User created successfully', result });
    else res.status(400).json({ message: result.message });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', details: (error as Error).message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const token = await authService.login(email, password);
    if (!token) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', details: (error as Error).message });
  }
});







app.post('/api/properties/create', AuthMiddleware(UserRole.USER), async (req, res) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;

    const userId = authenticatedReq.user?.id;

    const data : CreatePropertyRequest = req.body

    if (!userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const propertyId = await propertyService.create(data , userId);
    res.status(201).json({ id: propertyId });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating property in controller',
      details: (error as Error).message,
    });
  }
});


app.post('/api/properties/:id/upload/photo', AuthMiddleware(UserRole.USER), upload.single('photo'), async (req, res) => {
    try {
      // Validate file upload
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user?.id;
      const propertyId: number = parseInt(req.params.id);

      // Validate inputs
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      if (isNaN(propertyId) || propertyId <= 0) {
        return res.status(400).json({ error: 'Invalid property ID' });
      }

      // Check authorization
      const hasAccess = await propertyService.authorizePropertyPhotoUpload(propertyId, userId);
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Access denied - cannot upload photo to this property' 
        });
      }
      
      const uploadResult = await propertyService.prepareAndUploadSupabase(req.file, propertyId);

      // Save photo record to database
      const photoRecord = await propertyService.uploadPhotoRecord({
        propertyId,
        fileName: uploadResult.fileName,
        url: uploadResult.publicUrl,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        isMain: true
      });

      res.status(201).json({
        message: 'Photo uploaded successfully',
        photo: {
          id: photoRecord.id,
          fileName: uploadResult.fileName,
          url: uploadResult.publicUrl,
          size: req.file.size
        }
      });

    } catch (error) {
      console.error('Photo upload error:', error);
      
      // If database save fails but file was uploaded, consider cleaning up
      // You might want to delete the uploaded file from Supabase here
      
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Upload failed' 
      });
    }
  }
);


app.get('/api/properties/getAvailableProjects', async (req, res) => {
  try {

    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const result = await propertyService.getProjects(limit , page);

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error getting available projects',
      details: (error as Error).message,
    });
  }
});


app.get('/api/properties/getRequiredInterfaces', async (req, res) => {
  try {
    
    const result = await propertyService.getRequiredInterfaces();

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error getting properties interfaces',
      details: (error as Error).message,
    });
  }
});


app.get('/api/properties/:id',async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }

    const result = await propertyService.getPropertyById(id);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error getting property by ID',
      details: (error as Error).message,
    });
  }
});

app.get('/api/properties/status/counts', AuthMiddleware(UserRole.ADMIN), async (req, res) => {
  try {
    
    res.status(200).json(await propertyService.status());
  } catch (error) {
    res.status(500).json({
      message: 'Error getting property status counts',
      details: (error as Error).message,
    });
  }
});

app.get('/api/properties/status/approved', AuthMiddleware(UserRole.ADMIN), async (req, res) => {
  try {
    
    res.status(200).json(await propertyService.getApprovedProperties());
  } catch (error) {
    res.status(500).json({
      message: 'Error getting approved properties',
      details: (error as Error).message,
    });
  }
});

app.get('/api/properties/status/pending', AuthMiddleware(UserRole.ADMIN), async (req, res) => {
  try {
    
    res.status(200).json(await propertyService.getPendingProperties());
  } catch (error) {
    res.status(500).json({
      message: 'Error getting pending properties',
      details: (error as Error).message,
    });
  }
});

app.get('/api/properties', async (req, res) => {
  try {
    // Extract page and limit from query parameters (if provided)
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    // Pass to service (will use defaults if undefined)
    const result = await propertyService.getAllProperties(page, limit);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error getting properties',
      details: (error as Error).message,
    });
  }
});

app.patch('/api/properties/:id/approve',AuthMiddleware(UserRole.ADMIN), async (req, res) => {
  try {
    const propertyId : number = parseInt(req.params.id);
    const result = await propertyService.approve(propertyId);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error approving property',
      details: (error as Error).message,
    });
  }
});

app.delete('/api/properties/:id/reject', AuthMiddleware(UserRole.ADMIN), async (req, res) => {
  try {
    const propertyId : number = parseInt(req.params.id);
    const result = await propertyService.reject(propertyId);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error rejecting property',
      details: (error as Error).message,
    });
  }
});

export default app;