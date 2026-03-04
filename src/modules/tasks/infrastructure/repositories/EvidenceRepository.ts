import { Repository } from 'typeorm';
import { Evidence } from '../entities/Evidence';
import { AppDataSource } from '@infrastructure/database/connection';

export class EvidenceRepository {
  private repository: Repository<Evidence>;

  constructor() {
    this.repository = AppDataSource.getRepository(Evidence);
  }

  async findById(id: string): Promise<Evidence | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['task', 'uploadedBy'],
    });
  }

  async findByTask(taskId: string): Promise<Evidence[]> {
    return this.repository.find({
      where: { taskId },
      relations: ['uploadedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: Partial<Evidence>): Promise<Evidence> {
    const evidence = this.repository.create(data);
    return this.repository.save(evidence);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByTaskId(taskId: string): Promise<void> {
    await this.repository.delete({ taskId });
  }
}
