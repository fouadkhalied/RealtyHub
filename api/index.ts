import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import { UserService } from '../src/application/services/UserService';
import { sql } from '@vercel/postgres';

const app = express();
const userService = new UserService();

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/api/health', async (req, res) => {
  try {
    // A simple query to check the connection
    await sql`SELECT 1;`;
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', db: 'disconnected', details: (error as Error).message });
  }
});

app.get('/api', (req, res) => {
  const absPath = path.join(__dirname, '..', 'components', 'home.htm');
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(fs.readFileSync(absPath, 'utf-8'));
});

app.get('/api/about', (req, res) => {
  const absPath = path.join(__dirname, '..', 'components', 'about.htm');
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(fs.readFileSync(absPath, 'utf-8'));
});

app.get('/api/uploadUser', (req, res) => {
  const absPath = path.join(__dirname, '..', 'components', 'user_upload_form.htm');
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(fs.readFileSync(absPath, 'utf-8'));
});

app.post('/api/uploadSuccessful', async (req, res) => {
  const { name, email } = req.body;
  try {
    if (!name || !email) {
      return res.status(400).send('Name and email are required.');
    }
    await userService.createUser(name, email);
    res.status(200).send('<h1>User added successfully</h1>');
  } catch (error) {
    res.status(500).send('Error adding user');
  }
});

app.get('/api/allUsers', async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    if (users.length > 0) {
      let tableContent = users
        .map(
          (user) =>
            `<tr><td>${user.id}</td><td>${user.name}</td><td>${user.email}</td></tr>`
        )
        .join('');
      res.status(200).send(`
        <html>
          <head>
            <title>Users</title>
            <style>body{font-family:Arial,sans-serif;}table{width:100%;border-collapse:collapse;margin-bottom:15px;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background-color:#f2f2f2;}a{text-decoration:none;color:#0a16f7;margin:15px;}</style>
          </head>
          <body>
            <h1>Users</h1>
            <table><thead><tr><th>User ID</th><th>Name</th><th>Email</th></tr></thead><tbody>${tableContent}</tbody></table>
            <div><a href="/api">Home</a><a href="/api/uploadUser">Add User</a></div>
          </body>
        </html>
      `);
    } else {
      res.status(404).send('Users not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving users');
  }
});

export default app;
