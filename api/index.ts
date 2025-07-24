import express from 'express';
import bodyParser from 'body-parser';
import { AuthService } from '../src/modules/auth/services/AuthService';
import { UserRepositoryImplementation } from '../src/modules/user/infrastructure/UserRepositoryImplementation';
import { AuthMiddleware } from '../src/modules/auth/application/authMiddleware';
import { UserRole} from '../src/modules/user/domain/valueObjects/user-role.vo';
import { CreatePropertyRequest} from '../src/modules/properties/prestentaion/dto/CreatePropertyRequest.dto';
import {AuthenticatedRequest} from '../src/modules/auth/application/authMiddleware';
import { PropertyService} from '../src/modules/properties/application/properties.service';
import { PropertiesRepositoryImp} from '../src/modules/properties/infrastructure/PropertyRepositoryImp';

const app = express()
app.use(bodyParser.json());

const authService = new AuthService(new UserRepositoryImplementation());
const propertyService = new PropertyService(new PropertiesRepositoryImp());

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
      message: 'Error creating property',
      details: (error as Error).message,
    });
  }
});



export default app; 