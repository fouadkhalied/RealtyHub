import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import 'pg';

dotenv.config();

const databaseUrl = process.env.POSTGRES_URL as string;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  ssl: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
}); 