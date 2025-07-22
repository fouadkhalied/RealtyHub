import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import 'pg';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL as string;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
}); 