import { Repository } from 'typeorm';
import { Event } from '../entities/Event';
import { AppDataSource } from '@infrastructure/database/connection';
import { NotFoundError } from '@shared/errors';

export class EventRepository {
  private repository: Repository<Event>;

  constructor() {
    this.repository = AppDataSource.getRepository(Event);
  }

  async findById(id: string): Promise<Event | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['createdBy', 'assignedTo'],
    });
  }

  async findAll(): Promise<Event[]> {
    return this.repository.find({
      relations: ['createdBy', 'assignedTo'],
      order: { scheduledDate: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    return this.repository
      .createQueryBuilder('event')
      .where('event.scheduledDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .leftJoinAndSelect('event.createdBy', 'createdBy')
      .orderBy('event.scheduledDate', 'ASC')
      .getMany();
  }

  async create(data: Partial<Event>): Promise<Event> {
    const event = this.repository.create(data);
    return this.repository.save(event);
  }

  async update(id: string, data: Partial<Event>): Promise<Event> {
    await this.repository.update(id, data);
    const event = await this.findById(id);
    if (!event) throw new NotFoundError('Evento no encontrado');
    return event;
  }

  async saveWithRelations(event: Event): Promise<Event> {
    return this.repository.save(event);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
