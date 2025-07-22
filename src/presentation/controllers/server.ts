import express from 'express';
import bodyParser from 'body-parser';
import userRouter from './UserController';
import { sequelize } from '../../infrastructure/db/connection';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/users', userRouter);

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Database connected and synced.');
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})(); 