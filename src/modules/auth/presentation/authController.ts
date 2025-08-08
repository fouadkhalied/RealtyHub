import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { UserRole } from '../../user/domain/valueObjects/user-role.vo';
import { ErrorCode } from '../../../libs/common/errors/enums/basic.error.enum';
import { ERROR_STATUS_MAP } from '../../../libs/common/errors/mapper/mapperErrorEnum';

export class AuthController {
  constructor(private readonly authAppService: AuthService) {}

  async registerUser(req: Request, res: Response) {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email, and password are required.' });
    }
    try {
      const result = await this.authAppService.signup(UserRole.USER, username, email, password);

      if (result.success) {
        res.status(201).json(result);
      } else {
        const statusCode = ERROR_STATUS_MAP[result.error?.code as ErrorCode] || 400;
        res.status(statusCode).json(result);
      }
    } catch (error) {
      res.status(500).json({ message: 'Error creating user', details: (error as Error).message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'email, password are required.' });
      }
      const result = await this.authAppService.login(email, password);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        const statusCode = ERROR_STATUS_MAP[result.error?.code as ErrorCode] || 400;
        res.status(statusCode).json(result);
      }
    } catch (err: any) {
      return res.status(401).json({ error: err.message });
    }
  }

  async registerCustomerService(req: Request, res: Response) {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email, and password are required.' });
    }
    try {
      const result = await this.authAppService.signup(UserRole.CustomerService, username, email, password);

      if (result.success) {
        res.status(201).json(result);
      } else {
        const statusCode = ERROR_STATUS_MAP[result.error?.code as ErrorCode] || 400;
        res.status(statusCode).json(result);
      }
    } catch (error) {
      res.status(500).json({ message: 'Error creating user', details: (error as Error).message });
    }
  }
}