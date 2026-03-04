import { Request, Response, NextFunction } from 'express';
import { CreateUserUseCase } from '../application/CreateUserUseCase';
import { UserRepository } from '../infrastructure/repositories/UserRepository';
import { AuthRequest } from '@shared/middlewares/auth';

const userRepository = new UserRepository();
const createUserUseCase = new CreateUserUseCase(userRepository);

export class UserController {
  async createUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await createUserUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await userRepository.findAll();
      res.json({
        success: true,
        message: 'Usuarios obtenidos',
        data: users.map(u => ({
          id: u.id,
          code: u.code,
          name: u.name,
          role: u.role,
          email: u.email,
          phone: u.phone,
          isActive: u.isActive,
          createdAt: u.createdAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }
      res.json({
        success: true,
        data: {
          id: user.id,
          code: user.code,
          name: user.name,
          role: user.role,
          email: user.email,
          phone: user.phone,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await userRepository.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Usuario actualizado',
        data: {
          id: result.id,
          code: result.code,
          name: result.name,
          role: result.role,
          email: result.email,
          phone: result.phone,
          isActive: result.isActive,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await userRepository.delete(req.params.id);
      res.json({
        success: true,
        message: 'Usuario eliminado',
      });
    } catch (error) {
      next(error);
    }
  }
}
