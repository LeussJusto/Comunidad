import { Router } from 'express';
import { AuthController } from '@modules/auth/presentation/AuthController';

const router = Router();
const authController = new AuthController();

/**
 * @route POST /api/v1/auth/login
 * @desc Login de usuario
 * @access Public
 */
router.post('/login', authController.login);

export default router;
