import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../user/domain/entites/User';
import { UserRepositoryImplementation } from '../../user/infrastructure/UserRepositoryImplementation';
import { UserRole } from '../../user/domain/valueObjects/user-role.vo';

export class AuthService {
  constructor(private readonly userRepository: UserRepositoryImplementation) {}

  async signup(
    role: number,
    username: string,
    email: string,
    password: string
  ): Promise<{ token: string | null; message: string }> {
    if (role === UserRole.ADMIN) {
      return {token : null , message : 'unauthorized access'}
    }

    const userExists: User | null = await this.userRepository.findByEmail(email);
    
    if (userExists) {
      return { token: null, message: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user: User = await this.userRepository.create(
      new User({
        username,
        email,
        password: hashedPassword,
        role,
      })
    );

    if (user.role === UserRole.USER) {
      return await this.login(user.email, password);
    }

    return {
      token: null,
      message:
        user.role === UserRole.CustomerService
          ? "Customer service account created"
          : "User account created",
    };
  }

  async login(email: string, password: string): Promise<{ token: string | null; message: string }> {
    const user: User | null = await this.userRepository.findByEmail(email);

    if (!user) {
      return { token: null, message: "User not found" };
    }

    const passwordIsValid = await bcrypt.compare(password, user.password as string);

    if (!passwordIsValid) {
      return { token: null, message: "Invalid password" };
    }

    if (!process.env.JWT_SECRET) {
      return { token: null, message: "JWT_SECRET is not set in environment variables" };
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return { token, message: "Login successful" };
  }
}
