import { UserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async createUser(name: string, email: string): Promise<User> {
    const user = new User({ name, email });
    return this.userRepository.create(user);
  }

  async updateUser(id: number, name: string, email: string): Promise<User> {
    const user = new User({ id, name, email });
    return this.userRepository.update(user);
  }

  async deleteUser(id: number): Promise<void> {
    return this.userRepository.delete(id);
  }
} 