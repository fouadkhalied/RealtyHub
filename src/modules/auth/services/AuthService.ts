import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../user/domain/entites/User';
import { UserRepositoryImplementation } from '../../user/infrastructure/UserRepositoryImplementation';
import { UserRole } from '../../user/domain/valueObjects/user-role.vo';
import { ApiResponseInterface } from '../../../libs/common/apiResponse/interfaces/apiResponse.interface';
import { ErrorCode } from '../../../libs/common/errors/enums/basic.error.enum';
import { ErrorBuilder } from '../../../libs/common/errors/errorBuilder';
import { ResponseBuilder } from '../../../libs/common/apiResponse/apiResponseBuilder';

export class AuthService {
  constructor(private readonly userRepository: UserRepositoryImplementation) {}

  async signup(
    role: number,
    username: string,
    email: string,
    password: string
  ): Promise<ApiResponseInterface<{token : string | null , message : string}>> {
    if (role === UserRole.ADMIN) {
      return ErrorBuilder.build(ErrorCode.FORBIDDEN, "Unauthorized Access");
    }

    const userExists: User | null = await this.userRepository.findByEmail(email);
    
    if (userExists) {
      return ErrorBuilder.build(ErrorCode.VALIDATION_ERROR, "User already exists");
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
      const { data } = await this.login(user.email, password);
      if (!data?.token) {
        return ErrorBuilder.build(ErrorCode.AUTO_LOGIN_FAILED, "auto login after sign up for user role failed");
      }
      return ResponseBuilder.success({token : data.token , message : data.message});
    }

    return ResponseBuilder.success({
      token : null,
      message : user.role === UserRole.CustomerService
          ? "Customer service account created"
          : "Admin account created"});
  }

  async login(email: string, password: string): Promise<ApiResponseInterface<{ token: string | null; message: string }>> {
    const user: User | null = await this.userRepository.findByEmail(email);

    if (!user) {
      return ErrorBuilder.build(ErrorCode.USER_NOT_FOUND, "User does not exist. Sign up!");
    }

    const passwordIsValid = await bcrypt.compare(password, user.password as string);

    if (!passwordIsValid) {
      return ErrorBuilder.build(ErrorCode.INVALID_PASSWORD, "Invalid password");
    }

    if (!process.env.JWT_SECRET) {
      return ErrorBuilder.build(ErrorCode.SERVER_ERROR, "JWT_SECRET is not set in environment variables");
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

    return ResponseBuilder.success({ token, message: "Login successful" });
  }
}