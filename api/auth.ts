import express from 'express';
import bodyParser from 'body-parser';
import { AuthService } from '../src/application/services/AuthService';

const app = express();
const authService = new AuthService();

app.use(bodyParser.json());

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    const user = await authService.signup(name, email, password);
    res.status(201).json({ message: 'User created successfully', user });
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

export default app; 