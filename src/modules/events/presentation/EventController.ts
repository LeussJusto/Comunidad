import { Request, Response, NextFunction } from 'express';
import { CreateEventUseCase } from '../application/CreateEventUseCase';
import { EventRepository } from '../infrastructure/repositories/EventRepository';
import { UserRepository } from '@modules/users/infrastructure/repositories/UserRepository';
import { NotificationService } from '@modules/notifications/application/NotificationService';
import { NotificationRepository } from '@modules/notifications/infrastructure/repositories/NotificationRepository';
import { AuthRequest } from '@shared/middlewares/auth';

const eventRepository = new EventRepository();
const userRepository = new UserRepository();
const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);
const createEventUseCase = new CreateEventUseCase(eventRepository, userRepository);

export class EventController {
  async createEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await createEventUseCase.execute({
        ...req.body,
        createdById: req.userId!,
      });
      res.status(201).json({
        success: true,
        message: 'Evento creado exitosamente',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const events = await eventRepository.findAll();
      res.json({
        success: true,
        data: events,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEventById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const event = await eventRepository.findById(req.params.id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
      }
      res.json({
        success: true,
        data: event,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { assignedToIds, ...updateData } = req.body;
      
      // Actualizar datos básicos del evento
      const event = await eventRepository.update(req.params.id, updateData);
      
      // Si hay assignedToIds, actualizar usuarios asignados
      if (assignedToIds !== undefined) {
        if (assignedToIds && assignedToIds.length > 0) {
          const assignedUsers = await Promise.all(
            assignedToIds.map((id: string) => userRepository.findById(id))
          );
          event.assignedTo = assignedUsers.filter(u => u !== null) as any[];
        } else {
          event.assignedTo = [];
        }
        await eventRepository.saveWithRelations(event);
      }
      
      // Notificar a usuarios asignados o todos
      const result = await eventRepository.findById(req.params.id);
      // Si hay usuarios asignados específicamente, notificar SOLO a ellos
      // Si NO hay usuarios asignados, notificar a TODOS
      const usersToNotify = result?.assignedTo && result.assignedTo.length > 0
        ? result.assignedTo.map(u => u.id)
        : (await userRepository.findAll()).map(u => u.id);
      
      if (usersToNotify.length > 0 && result) {
        await notificationService.notifyEventUpdated(
          result.id,
          result.title,
          usersToNotify
        );
      }
      
      res.json({
        success: true,
        message: 'Evento actualizado',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Eliminar notificaciones asociadas a este evento
      await notificationService.deleteNotificationsByEventId(req.params.id);
      
      // Eliminar el evento
      await eventRepository.delete(req.params.id);
      
      res.json({
        success: true,
        message: 'Evento eliminado',
      });
    } catch (error) {
      next(error);
    }
  }
}
