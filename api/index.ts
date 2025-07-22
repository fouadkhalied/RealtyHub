import { NowRequest, NowResponse } from '@vercel/node';
import path from 'path';
import fs from 'fs';
import { UserService } from '../src/application/services/UserService';
import { UserRepositoryImpl } from '../src/infrastructure/orm/UserRepositoryImpl';
import { sequelize } from '../src/infrastructure/db/connection';

const userService = new UserService(new UserRepositoryImpl());

const serveHtml = (filePath: string, res: NowResponse) => {
  const absPath = path.join(__dirname, '..', 'components', filePath);
  if (fs.existsSync(absPath)) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(fs.readFileSync(absPath, 'utf-8'));
  } else {
    res.status(404).send('Not found');
  }
};

export default async (req: NowRequest, res: NowResponse) => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    if (req.url === '/health' && req.method === 'GET') {
      return res.status(200).json({ status: 'ok', db: 'connected'});
    }
    if (req.url === '/' && req.method === 'GET') {
      return serveHtml('home.htm', res);
    }
    if (req.url === '/about' && req.method === 'GET') {
      return serveHtml('about.htm', res);
    }
    if (req.url === '/uploadUser' && req.method === 'GET') {
      return serveHtml('user_upload_form.htm', res);
    }
    if (req.url === '/uploadSuccessful' && req.method === 'POST') {
      const { name, email } = (req.body || {}) as { name: string; email: string };
      await userService.createUser(name, email);
      res.status(200).send('<h1>User added successfully</h1>');
    }
    if (req.url === '/allUsers' && req.method === 'GET') {
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
              <div><a href="/">Home</a><a href="/uploadUser">Add User</a></div>
            </body>
          </html>
        `);
      } else {
        res.status(404).send('Users not found');
      }
    }
    res.status(404).send('Not found');
  } catch (err) {
    res.status(500).send('Internal Server Error: ' + (err instanceof Error ? err.message : String(err)));
  }
};
