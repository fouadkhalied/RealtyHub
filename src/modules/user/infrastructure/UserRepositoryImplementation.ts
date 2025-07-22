import { User } from "../domain/entites/User";
import { sql } from "@vercel/postgres";
import { UserRepository } from "../domain/repository/UserRepository.interface";

export class UserRepositoryImplementation implements UserRepository {
  async findById(id: number): Promise<User | null> {
    const result = await sql`SELECT * FROM users WHERE id = ${id}`;
    return result.rows[0] as User;
  } 

  async findByEmail(email: string): Promise<User | null> {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    return result.rows[0] as User;
  }

  async create(user: User): Promise<User> {
    const result = await sql`INSERT INTO users (username, email, password) VALUES (${user.username}, ${user.email}, ${user.password}) RETURNING *`;
    return result.rows[0] as User;
  }

  async findAll(): Promise<User[]> {
    const result = await sql`SELECT username, email FROM users`;
    return result.rows as User[];
  }

  async update(user: User): Promise<User> {
    const result = await sql`UPDATE users SET username = ${user.username}, email = ${user.email}, password = ${user.password} WHERE id = ${user.id} RETURNING *`;
    return result.rows[0] as User;
  }

  async delete(id: number): Promise<void> {
    await sql`DELETE FROM users WHERE id = ${id}`;
  }
}
