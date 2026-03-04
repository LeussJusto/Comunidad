import { Repository } from 'typeorm';
import { Notification } from '../entities/Notification';
import { AppDataSource } from '@infrastructure/database/connection';
import { NotificationType } from '@shared/enums';

export class NotificationRepository {
  private repository: Repository<Notification>;

  constructor() {
    this.repository = AppDataSource.getRepository(Notification);
  }

  async findById(id: string): Promise<Notification | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUser(userId: string, onlyUnread: boolean = false): Promise<Notification[]> {
    const where: any = { userId };
    if (onlyUnread) {
      where.isRead = false;
    }
    return this.repository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: Partial<Notification>): Promise<Notification> {
    const notification = this.repository.create(data);
    return this.repository.save(notification);
  }

  async markAsRead(id: string): Promise<void> {
    await this.repository.update(id, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repository.update({ userId }, { isRead: true });
  }

  async deleteByTaskId(taskId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .where("JSON_EXTRACT(metadata, '$.taskId') = :taskId", { taskId })
      .execute();
  }

  async deleteByEventId(eventId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .where("JSON_EXTRACT(metadata, '$.eventId') = :eventId", { eventId })
      .execute();
  }
}
