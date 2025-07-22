import { sql } from '@vercel/postgres';
import { User, UserProps } from '../../domain/entities/User';

export class UserService {
  async getUserById(id: number): Promise<User | null> {
    const { rows } = await sql`SELECT * FROM users WHERE id = ${id};`;
    if (rows.length === 0) {
      return null;
    }
    return new User(rows[0] as UserProps);
  }

  async getAllUsers(): Promise<User[]> {
    const { rows } = await sql`SELECT * FROM users;`;
    return rows.map(row => new User(row as UserProps));
  }

  async createUser(name: string, email: string): Promise<User> {
    const { rows } = await sql`INSERT INTO users (name, email) VALUES (${name}, ${email}) RETURNING *;`;
    return new User(rows[0] as UserProps);
  }

  async updateUser(id: number, name: string, email: string): Promise<User> {
    const { rows } = await sql`UPDATE users SET name = ${name}, email = ${email} WHERE id = ${id} RETURNING *;`;
    if (rows.length === 0) {
      throw new Error('User not found');
    }
    return new User(rows[0] as UserProps);
  }

  async deleteUser(id: number): Promise<void> {
    await sql`DELETE FROM users WHERE id = ${id};`;
  }
} 