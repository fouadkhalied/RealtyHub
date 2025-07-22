import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserProps } from '../../domain/entities/User';

export class AuthService {
  async signup(name: string, email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
      RETURNING id, name, email, "createdAt", "updatedAt";
    `;
    return new User(rows[0] as UserProps);
  }

  async login(email: string, password: string): Promise<string | null> {
    const { rows } = await sql`SELECT * FROM users WHERE email = ${email};`;
    if (rows.length === 0) {
      return null; // User not found
    }

    const user = rows[0];
    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      return null; // Invalid password
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set in environment variables');
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return token;
  }
} 