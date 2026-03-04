import { EventRepository } from '../infrastructure/repositories/EventRepository';
import { UserRepository } from '@modules/users/infrastructure/repositories/UserRepository';
import { NotificationService } from '@modules/notifications/application/NotificationService';
import { NotificationRepository } from '@modules/notifications/infrastructure/repositories/NotificationRepository';
import { ValidationError } from '@shared/errors';
import { EventType, EventPriority } from '@shared/enums';

interface CreateEventInput {
  title: string;
  description: string;
  type: EventType;
  priority: EventPriority;
  scheduledDate: Date;
  location?: string;
  createdById: string;
  assignedToIds?: string[];
}

export class CreateEventUseCase {
  private notificationService: NotificationService;

  constructor(
    private eventRepository: EventRepository,
    private userRepository: UserRepository
  ) {
    const notificationRepository = new NotificationRepository();
    this.notificationService = new NotificationService(notificationRepository);
  }

  async execute(input: CreateEventInput) {
    const { title, description, type, scheduledDate, createdById, assignedToIds } = input;

    if (!title || !description || !type || !scheduledDate || !createdById) {
      throw new ValidationError('Todos los campos obligatorios deben ser proporcionados');
    }

    // Crear el evento sin assignedTo primero
    const { assignedToIds: _, ...eventData } = input;
    const event = await this.eventRepository.create(eventData);

    // Si hay usuarios asignados, cargar y asignar
    if (assignedToIds && assignedToIds.length > 0) {
      const assignedUsers = await Promise.all(
        assignedToIds.map(id => this.userRepository.findById(id))
      );
      event.assignedTo = assignedUsers.filter(u => u !== null) as any[];
      await this.eventRepository.saveWithRelations(event);
    }

    // Notificar a los usuarios asignados o a todos los usuarios activos
    // Si hay usuarios asignados específicamente, notificar SOLO a ellos
    // Si NO hay usuarios asignados, notificar a TODOS (incluyendo al creador)
    const usersToNotify = assignedToIds && assignedToIds.length > 0 
      ? assignedToIds
      : (await this.userRepository.findAll()).map(u => u.id);
    
    if (usersToNotify.length > 0) {
      await this.notificationService.notifyEventCreated(
        event.id,
        event.title,
        usersToNotify
      );
    }

    return await this.eventRepository.findById(event.id);
  }
}
