import { DataSource } from 'typeorm';
import { config } from '@config/index';
import { User } from '@modules/users/infrastructure/entities/User';
import { Event } from '@modules/events/infrastructure/entities/Event';
import { Task } from '@modules/tasks/infrastructure/entities/Task';
import { Evidence } from '@modules/tasks/infrastructure/entities/Evidence';
import { Notification } from '@modules/notifications/infrastructure/entities/Notification';
import { Report } from '@modules/reports/infrastructure/entities/Report';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.database.host,
  port: config.database.port,
  username: config.database.user,
  password: config.database.password,
  database: config.database.database,
  synchronize: config.server.nodeEnv === 'development', // Solo en desarrollo
  logging: config.server.nodeEnv === 'development',
  entities: [User, Event, Task, Evidence, Notification, Report],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
  subscribers: [],
});

export const initDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};
