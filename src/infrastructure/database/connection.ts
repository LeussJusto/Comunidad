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

const seedDefaultPresidentUser = async () => {
  // Seed idempotente: inserta solo si no existe el código de usuario.
  await AppDataSource.query(
    `
    INSERT INTO users (id, code, password, name, email, phone, role, isActive)
    SELECT UUID(), ?, ?, ?, ?, ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM users WHERE code = ?
    )
    `,
    [
      '74664032',
      '$2a$12$QIZXtfsvpll9eHzVoN3pk.4toZPkvz9TpAGxtJRkuWI28zFbxcWkq',
      'Leonardo Manuel Justo Jurado',
      'leuss1224@gmail.com',
      '924783804',
      'president',
      1,
      '74664032',
    ]
  );
};

export const initDatabase = async () => {
  try {
    await AppDataSource.initialize();
    await seedDefaultPresidentUser();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};
