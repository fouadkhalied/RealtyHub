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

const app = express()
app.use(bodyParser.json());

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


app.get('/api/properties/getAvailableProjects', async (req, res) => {
  try {

    const result = await propertyService.getProjects();

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error getting available projects',
      details: (error as Error).message,
    });
  }
});

app.get('/api/properties/getPropertyTypes', async (req, res) => {
  try {

    const result = await propertyService.getProjects();

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error getting propertyTypes',
      details: (error as Error).message,
    });
  }
});

// REMOVED DUPLICATE ROUTE - This was the conflict

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


app.get('/api/properties/:id', async (req, res) => {
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
    
    res.status(200).json(await propertyService.getApproved());
  } catch (error) {
    res.status(500).json({
      message: 'Error getting approved properties',
      details: (error as Error).message,
    });
  }
});

app.get('/api/properties/status/pending', AuthMiddleware(UserRole.ADMIN), async (req, res) => {
  try {
    
    res.status(200).json(await propertyService.getPending());
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