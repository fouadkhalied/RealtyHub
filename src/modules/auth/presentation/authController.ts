import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { UserRole } from '../../user/domain/valueObjects/user-role.vo';

export class AuthController {
  constructor(private readonly authAppService: AuthService) {}

  async registerUser(req: Request, res: Response) {
    const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'username, email, and password are required.' });
  }
  try {
    const result = await this.authAppService.signup(UserRole.USER , username, email, password);    

    if (result.token) res.status(201).json({ message: 'User created successfully', result });
    else res.status(400).json({ message: result.message });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', details: (error as Error).message });
  }
  }

  async login(req: Request, res: Response) {
    try {
        const { email , password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'email , password are required.' });
        }
      const result = await this.authAppService.login(email,password);
      return res.status(200).json(result);
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
    const result = await this.authAppService.signup(UserRole.CustomerService , username, email, password);    

    if (result.token) res.status(201).json({ message: 'User created successfully', result });
    else res.status(400).json({ message: result.message });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', details: (error as Error).message });
  }
  }
}
