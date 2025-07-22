import express, { Request, Response } from 'express';
import { UserService } from '../../application/services/UserService';
import { UserRepositoryImpl } from '../../infrastructure/orm/UserRepositoryImpl';

const userRepository = new UserRepositoryImpl();
const userService = new UserService(userRepository);

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  res.json(users);
});

router.get('/:id', async (req: Request, res: Response) => {
  const user = await userService.getUserById(Number(req.params.id));
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

router.post('/', async (req: Request, res: Response) => {
  const { name, email } = req.body;
  const user = await userService.createUser(name, email);
  res.status(201).json(user);
});

router.put('/:id', async (req: Request, res: Response) => {
  const { name, email } = req.body;
  try {
    const user = await userService.updateUser(Number(req.params.id), name, email);
    res.json(user);
  } catch (e) {
    res.status(404).json({ message: 'User not found' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  await userService.deleteUser(Number(req.params.id));
  res.status(204).send();
});

export default router; 