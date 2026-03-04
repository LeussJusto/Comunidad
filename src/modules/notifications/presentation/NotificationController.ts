import { Request, Response, NextFunction } from 'express';
import { NotificationRepository } from '../infrastructure/repositories/NotificationRepository';
import { AuthRequest } from '@shared/middlewares/auth';

const notificationRepository = new NotificationRepository();

export class NotificationController {
  async getMyNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notifications = await notificationRepository.findByUser(req.userId!, false);
      console.log(`📬 Usuario ${req.userId} tiene ${notifications.length} notificaciones totales`);
      res.json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const unread = await notificationRepository.findByUser(req.userId!, true);
      res.json({
        success: true,
        data: { count: unread.length },
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationRepository.markAsRead(req.params.id);
      res.json({
        success: true,
        message: 'Notificación marcada como leída',
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationRepository.markAllAsRead(req.userId!);
      res.json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas',
      });
    } catch (error) {
      next(error);
    }
  }
}
