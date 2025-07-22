import express from 'express';
import bodyParser from 'body-parser';
import { UserService } from '../src/application/services/UserService';
import { sql } from '@vercel/postgres';

const app = express();
const userService = new UserService();

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', async (req, res) => {
  try {
    // A simple query to check the connection
    await sql`SELECT 1;`;
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      db: 'disconnected', 
      details: (error as Error).message 
    });
  }
});

// Home route - returns app info
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the API',
    version: '1.0.0',
    endpoints: [
      'GET /api/health - Health check',
      'GET /api/about - About information',
      'POST /api/users - Create user',
      'GET /api/users - Get all users',
      'POST /api/auth/login - User login',
      'POST /api/auth/signup - User signup'
    ]
  });
});

// About route - returns app information
app.get('/api/about', (req, res) => {
  res.status(200).json({
    name: 'User Management API',
    description: 'A simple API for managing users',
    version: '1.0.0',
    author: 'Your Name',
    features: [
      'User registration',
      'User authentication',
      'User management',
      'Health monitoring'
    ]
  });
});

// User signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
        missing_fields: {
          name: !name,
          email: !email,
          password: !password
        }
      });
    }

    // Here you would typically hash the password and create user
    // For now, just using the existing createUser method
    await userService.createUser(name, email);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        name,
        email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user account',
      error: (error as Error).message
    });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Here you would typically verify credentials
    // This is a placeholder implementation
    const users = await userService.getAllUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // In a real app, you'd verify the password hash and generate a JWT token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      // token: 'your-jwt-token-here'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: (error as Error).message
    });
  }
});

// Create user (alternative endpoint)
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  
  try {
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required',
        missing_fields: {
          name: !name,
          email: !email
        }
      });
    }

    const result = await userService.createUser(name, email);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        name,
        email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: (error as Error).message
    });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    
    if (users.length > 0) {
      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        count: users.length,
        users: users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email
        }))
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'No users found',
        count: 0,
        users: []
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: (error as Error).message
    });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const users = await userService.getAllUsers();
    const user = users.find(u => u.id?.toString() === id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: (error as Error).message
    });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  
  try {
    // This would require implementing an updateUser method in your UserService
    // For now, returning a placeholder response
    res.status(200).json({
      success: true,
      message: 'User update functionality not yet implemented',
      note: 'You need to implement updateUser method in UserService'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: (error as Error).message
    });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // This would require implementing a deleteUser method in your UserService
    // For now, returning a placeholder response
    res.status(200).json({
      success: true,
      message: 'User delete functionality not yet implemented',
      note: 'You need to implement deleteUser method in UserService'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: (error as Error).message
    });
  }
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

export default app;