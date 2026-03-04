import { Router } from 'express';
import { NotificationController } from './NotificationController';
import { authenticate } from '@shared/middlewares/auth';

const router = Router();
const notificationController = new NotificationController();

/**
 * @route GET /api/v1/notifications/my
 * @desc Obtener mis notificaciones
 * @access Private
 */
router.get('/my', authenticate, notificationController.getMyNotifications);

/**
 * @route GET /api/v1/notifications/unread-count
 * @desc Obtener cantidad de notificaciones no leídas
 * @access Private
 */
router.get('/unread-count', authenticate, notificationController.getUnreadCount);

/**
 * @route PATCH /api/v1/notifications/:id/read
 * @desc Marcar notificación como leída
 * @access Private
 */
router.patch('/:id/read', authenticate, notificationController.markAsRead);

/**
 * @route PATCH /api/v1/notifications/mark-all-read
 * @desc Marcar todas las notificaciones como leídas
 * @access Private
 */
router.patch('/mark-all-read', authenticate, notificationController.markAllAsRead);

export default router;
