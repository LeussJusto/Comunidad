import { Router } from 'express';
import { TaskController } from './TaskController';
import { authenticate, authorize } from '@shared/middlewares/auth';
import { upload, handleMulterError } from '@shared/middlewares/upload';
import { UserRole } from '@shared/enums';

const router = Router();
const taskController = new TaskController();

/**
 * @route POST /api/v1/tasks
 * @desc Crear nueva tarea (presidente o admin)
 * @access Private - President, Admin
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.PRESIDENT, 'admin'),
  taskController.createTask
);

/**
 * @route GET /api/v1/tasks
 * @desc Obtener todas las tareas
 * @access Private
 */
router.get('/', authenticate, taskController.getAllTasks);

/**
 * @route GET /api/v1/tasks/my-tasks
 * @desc Obtener mis tareas asignadas
 * @access Private
 */
router.get('/my-tasks', authenticate, taskController.getMyTasks);

/**
 * @route GET /api/v1/tasks/:id
 * @desc Obtener tarea por ID
 * @access Private
 */
router.get('/:id', authenticate, taskController.getTaskById);

/**
 * @route PATCH /api/v1/tasks/:id/status
 * @desc Actualizar estado de tarea
 * @access Private
 */
router.patch('/:id/status', authenticate, taskController.updateTaskStatus);

/**
 * @route POST /api/v1/tasks/:id/evidence
 * @desc Subir evidencia a una tarea (foto/audio/documento) o voucher
 * @access Private
 */
router.post(
  '/:id/evidence',
  authenticate,
  upload.single('file'),
  handleMulterError,
  taskController.uploadEvidence
);

/**
 * @route GET /api/v1/tasks/:id/evidences
 * @desc Obtener todas las evidencias de una tarea
 * @access Private
 */
router.get('/:id/evidences', authenticate, taskController.getTaskEvidences);

/**
 * @route GET /api/v1/tasks/:id/vouchers
 * @desc Obtener todos los vouchers de una tarea
 * @access Private
 */
router.get('/:id/vouchers', authenticate, taskController.getTaskVouchers);

/**
 * @route PUT /api/v1/tasks/:id
 * @desc Actualizar tarea (presidente o admin)
 * @access Private - President, Admin
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.PRESIDENT, 'admin'),
  taskController.updateTask
);

/**
 * @route DELETE /api/v1/tasks/:id
 * @desc Eliminar tarea (presidente o admin)
 * @access Private - President, Admin
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.PRESIDENT, 'admin'),
  taskController.deleteTask
);

export default router;
