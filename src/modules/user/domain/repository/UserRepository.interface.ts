import { User } from '../entites/User';

export interface UserRepositoryInterface {
  findById(id: number): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: number): Promise<void>;
} 