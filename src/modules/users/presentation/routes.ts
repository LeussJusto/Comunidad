import { Router } from 'express';
import { UserController } from './UserController';
import { authenticate, authorize } from '@shared/middlewares/auth';
import { UserRole } from '@shared/enums';

const router = Router();
const userController = new UserController();

/**
 * @route POST /api/v1/users
 * @desc Crear nuevo usuario (presidente o admin)
 * @access Private - President, Admin
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.PRESIDENT, 'admin'),
  userController.createUser
);

/**
 * @route GET /api/v1/users
 * @desc Obtener todos los usuarios
 * @access Private - President, Secretary, Admin
 */
router.get(
  '/',
  authenticate,
  authorize(UserRole.PRESIDENT, UserRole.SECRETARY, 'admin'),
  userController.getAllUsers
);

/**
 * @route GET /api/v1/users/:id
 * @desc Obtener usuario por ID
 * @access Private
 */
router.get('/:id', authenticate, userController.getUserById);

/**
 * @route PUT /api/v1/users/:id
 * @desc Actualizar usuario (presidente o admin)
 * @access Private - President, Admin
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.PRESIDENT, 'admin'),
  userController.updateUser
);

/**
 * @route DELETE /api/v1/users/:id
 * @desc Eliminar usuario (presidente o admin)
 * @access Private - President, Admin
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.PRESIDENT, 'admin'),
  userController.deleteUser
);

export default router;
