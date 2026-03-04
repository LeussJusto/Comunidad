import { Repository } from 'typeorm';
import { User } from '../entities/User';
import { AppDataSource } from '@infrastructure/database/connection';
import { NotFoundError } from '@shared/errors';

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByCode(code: string): Promise<User | null> {
    return this.repository.findOne({ where: { code } });
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async findByRole(role: string): Promise<User[]> {
    return this.repository.find({ where: { role: role as any } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.repository.create(data);
    return this.repository.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.repository.update(id, data);
    const user = await this.findById(id);
    if (!user) throw new NotFoundError('Usuario no encontrado');
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
