import { NotificationRepository } from '../infrastructure/repositories/NotificationRepository';
import { NotificationType } from '@shared/enums';
import { config } from '@config/index';
import { getWebSocketServer } from '@infrastructure/websocket/socket';
import { logger } from '@shared/utils/logger';

interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  metadata?: any;
}

export class NotificationService {
  constructor(private notificationRepository: NotificationRepository) {}

  async send(input: CreateNotificationInput): Promise<void> {
    if (!config.notifications.enabled) {
      return;
    }

    // Guardar en base de datos
    const notification = await this.notificationRepository.create(input);
    
    // Emitir vía WebSocket si el usuario está conectado
    try {
      const wsServer = getWebSocketServer();
      wsServer.emitToUser(input.userId, 'notification', {
        id: notification.id,
        type: input.type,
        title: input.title,
        message: input.message,
        metadata: input.metadata,
        createdAt: notification.createdAt,
      });
      logger.info(`📢 Notificación enviada vía WebSocket a usuario ${input.userId}: ${input.title}`);
    } catch (error) {
      // Si WebSocket no está inicializado, solo guardar en BD
      logger.warn('WebSocket no disponible, notificación guardada solo en BD');
    }
  }

  async sendToMultiple(userIds: string[], input: Omit<CreateNotificationInput, 'userId'>): Promise<void> {
    const promises = userIds.map(userId =>
      this.send({ ...input, userId })
    );
    await Promise.all(promises);
  }

  async notifyEventCreated(eventId: string, eventTitle: string, userIds: string[]): Promise<void> {
    await this.sendToMultiple(userIds, {
      type: NotificationType.EVENT_CREATED,
      title: 'Nuevo Evento',
      message: `Se ha creado el evento: ${eventTitle}`,
      metadata: { eventId },
    });
  }

  async notifyEventUpdated(eventId: string, eventTitle: string, userIds: string[]): Promise<void> {
    await this.sendToMultiple(userIds, {
      type: NotificationType.EVENT_UPDATED,
      title: 'Evento Actualizado',
      message: `Se ha actualizado el evento: ${eventTitle}`,
      metadata: { eventId },
    });
  }

  async notifyTaskAssigned(taskId: string, taskTitle: string, userId: string): Promise<void> {
    await this.send({
      type: NotificationType.TASK_ASSIGNED,
      title: 'Tarea Asignada',
      message: `Se te ha asignado la tarea: ${taskTitle}`,
      userId,
      metadata: { taskId },
    });
  }

  async notifyTaskCompleted(taskId: string, taskTitle: string, userIds: string[]): Promise<void> {
    await this.sendToMultiple(userIds, {
      type: NotificationType.TASK_COMPLETED,
      title: 'Tarea Completada',
      message: `Se ha completado la tarea: ${taskTitle}`,
      metadata: { taskId },
    });
  }

  async notifyIncidentReported(taskId: string, description: string, userIds: string[]): Promise<void> {
    await this.sendToMultiple(userIds, {
      type: NotificationType.INCIDENT_REPORTED,
      title: 'Incidencia Reportada',
      message: `Nueva incidencia: ${description}`,
      metadata: { taskId },
    });
  }

  async notifyVoucherUploaded(taskId: string, amount: number, userIds: string[]): Promise<void> {
    await this.sendToMultiple(userIds, {
      type: NotificationType.VOUCHER_UPLOADED,
      title: 'Voucher Cargado',
      message: `Nuevo comprobante de gasto: $${amount.toFixed(2)}`,
      metadata: { taskId, amount },
    });
  }

  async deleteNotificationsByTaskId(taskId: string): Promise<void> {
    await this.notificationRepository.deleteByTaskId(taskId);
    logger.info(`🗑️ Notificaciones de la tarea ${taskId} eliminadas`);
  }

  async deleteNotificationsByEventId(eventId: string): Promise<void> {
    await this.notificationRepository.deleteByEventId(eventId);
    logger.info(`🗑️ Notificaciones del evento ${eventId} eliminadas`);
  }
}
