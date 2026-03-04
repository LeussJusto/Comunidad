import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from '@modules/events/infrastructure/entities/Event';
import { Task } from '@modules/tasks/infrastructure/entities/Task';
import { User } from '@modules/users/infrastructure/entities/User';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  filePath: string;

  @ManyToOne(() => Event, { nullable: true })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'event_id', nullable: true })
  eventId: string;

  @ManyToOne(() => Task, { nullable: true })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ name: 'task_id', nullable: true })
  taskId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'generated_by' })
  generatedBy: User;

  @Column({ name: 'generated_by' })
  generatedById: string;

  @CreateDateColumn()
  createdAt: Date;
}
