import { TaskRepository } from '../infrastructure/repositories/TaskRepository';
import { NotificationService } from '@modules/notifications/application/NotificationService';
import { NotificationRepository } from '@modules/notifications/infrastructure/repositories/NotificationRepository';
import { ValidationError } from '@shared/errors';
import { TaskStatus } from '@shared/enums';

interface CreateTaskInput {
  title: string;
  description: string;
  assignedToId: string;
  createdById: string;
  location?: string;
  scheduledDate?: Date;
  notes?: string;
}

export class CreateTaskUseCase {
  private notificationService: NotificationService;

  constructor(private taskRepository: TaskRepository) {
    const notificationRepository = new NotificationRepository();
    this.notificationService = new NotificationService(notificationRepository);
  }

  async execute(input: CreateTaskInput) {
    const { title, description, assignedToId, createdById } = input;

    if (!title || !description || !assignedToId || !createdById) {
      throw new ValidationError('Todos los campos obligatorios deben ser proporcionados');
    }

    const task = await this.taskRepository.create({
      ...input,
      status: TaskStatus.PENDING,
    });

    // Notificar al usuario asignado
    await this.notificationService.notifyTaskAssigned(
      task.id,
      task.title,
      assignedToId
    );

    return task;
  }
}
