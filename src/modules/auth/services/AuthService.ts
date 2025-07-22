import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserProps } from '../../user/domain/entites/User';
import { UserRepositoryImplementation } from '../../user/infrastructure/UserRepositoryImplementation';

export class AuthService {
  constructor(private readonly userRepository: UserRepositoryImplementation) {}
  async signup(name: string, email: string, password: string): Promise<{token: string | null , message: string}> {
    const userExists : User | null = await this.userRepository.findByEmail(email);
    
    if (userExists) {
      return {token: null, message: "User already exists"};
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user : User = await this.userRepository.create(new User({
      username: name,
      email,
      password: hashedPassword,
    }));

    const {token, message} = await this.login(user.email , password as string)

    return {token, message};
  }

  async login(email: string, password: string): Promise<{token: string | null , message: string}> {
    const user : User | null = await this.userRepository.findByEmail(email);
    
    if (!user) {
      return {token: null, message: "User not found"};
    }

    const passwordIsValid = await bcrypt.compare(password, user.password as string);

    console.log(password , user.password);
    
    
    if (!passwordIsValid) {
      return {token: null, message: "Invalid password"};
    }

    if (!process.env.JWT_SECRET) {
      return {token: null, message: "JWT_SECRET is not set in environment variables"};
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return {token, message: "Login successful"};
  }
} 