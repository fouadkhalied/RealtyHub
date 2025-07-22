import { UserRepository } from '../../domain/repositories/UserRepository';
import { User, UserProps } from '../../domain/entities/User';
import { UserModel } from './UserModel';

export class UserRepositoryImpl implements UserRepository {
  async findById(id: number): Promise<User | null> {
    const user = await UserModel.findByPk(id);
    return user ? new User(user.toJSON() as UserProps) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await UserModel.findAll();
    return users.map(u => new User(u.toJSON() as UserProps));
  }

  async create(user: User): Promise<User> {
    const created = await UserModel.create({ name: user.name, email: user.email });
    return new User(created.toJSON() as UserProps);
  }

  async update(user: User): Promise<User> {
    const [count, [updated]] = await UserModel.update(
      { name: user.name, email: user.email },
      { where: { id: user.id }, returning: true }
    );
    if (!updated) throw new Error('User not found');
    return new User(updated.toJSON() as UserProps);
  }

  async delete(id: number): Promise<void> {
    await UserModel.destroy({ where: { id } });
  }
} 