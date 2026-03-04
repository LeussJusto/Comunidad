import { Repository } from 'typeorm';
import { Task } from '../entities/Task';
import { AppDataSource } from '@infrastructure/database/connection';
import { NotFoundError } from '@shared/errors';
import { TaskStatus } from '@shared/enums';

export class TaskRepository {
  private repository: Repository<Task>;

  constructor() {
    this.repository = AppDataSource.getRepository(Task);
  }

  async findById(id: string): Promise<Task | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy', 'evidences'],
    });
  }

  async findAll(): Promise<Task[]> {
    return this.repository.find({
      relations: ['assignedTo', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<Task[]> {
    return this.repository.find({
      where: { assignedToId: userId },
      relations: ['evidences'],
      order: { scheduledDate: 'ASC' },
    });
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return this.repository.find({
      where: { status },
      relations: ['assignedTo'],
    });
  }


  async create(data: Partial<Task>): Promise<Task> {
    const task = this.repository.create(data);
    return this.repository.save(task);
  }

  async update(id: string, data: Partial<Task>): Promise<Task> {
    await this.repository.update(id, data);
    const task = await this.findById(id);
    if (!task) throw new NotFoundError('Tarea no encontrada');
    return task;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
