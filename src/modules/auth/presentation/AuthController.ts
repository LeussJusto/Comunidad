import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '../application/LoginUseCase';
import { UserRepository } from '@modules/users/infrastructure/repositories/UserRepository';

const userRepository = new UserRepository();
const loginUseCase = new LoginUseCase(userRepository);

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await loginUseCase.execute(req.body);
      res.json({
        success: true,
        message: 'Login exitoso',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
