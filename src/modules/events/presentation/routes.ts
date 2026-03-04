import { Router } from 'express';
import { EventController } from './EventController';
import { authenticate, authorize } from '@shared/middlewares/auth';
import { UserRole } from '@shared/enums';

const router = Router();
const eventController = new EventController();

/**
 * @route POST /api/v1/events
 * @desc Crear nuevo evento (presidente o admin)
 * @access Private - President, Admin
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.PRESIDENT, 'admin'),
  eventController.createEvent
);

/**
 * @route GET /api/v1/events
 * @desc Obtener todos los eventos
 * @access Private
 */
router.get('/', authenticate, eventController.getAllEvents);

/**
 * @route GET /api/v1/events/:id
 * @desc Obtener evento por ID
 * @access Private
 */
router.get('/:id', authenticate, eventController.getEventById);

/**
 * @route PUT /api/v1/events/:id
 * @desc Actualizar evento (presidente o admin)
 * @access Private - President, Admin
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.PRESIDENT, 'admin'),
  eventController.updateEvent
);

/**
 * @route DELETE /api/v1/events/:id
 * @desc Eliminar evento (presidente o admin)
 * @access Private - President, Admin
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.PRESIDENT, 'admin'),
  eventController.deleteEvent
);

export default router;
