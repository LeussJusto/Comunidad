import { AppDataSource } from '@infrastructure/database/connection';
import { Report } from '../entities/Report';

export class ReportRepository {
  private repository = AppDataSource.getRepository(Report);

  async create(data: Partial<Report>): Promise<Report> {
    const report = this.repository.create(data);
    return await this.repository.save(report);
  }

  async findAll(): Promise<Report[]> {
    return await this.repository.find({
      relations: ['event', 'task', 'generatedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Report | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['event', 'task', 'generatedBy'],
    });
  }

  async findByEvent(eventId: string): Promise<Report[]> {
    return await this.repository.find({
      where: { eventId },
      relations: ['event', 'task', 'generatedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<Report[]> {
    return await this.repository.find({
      where: { generatedById: userId },
      relations: ['event', 'task', 'generatedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
