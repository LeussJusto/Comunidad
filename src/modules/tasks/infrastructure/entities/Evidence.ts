import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EvidenceType, EvidenceCategory } from '@shared/enums';
import { Task } from './Task';
import { User } from '@modules/users/infrastructure/entities/User';

@Entity('evidences')
export class Evidence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: EvidenceType,
  })
  type: EvidenceType;

  @Column({
    type: 'enum',
    enum: EvidenceCategory,
  })
  category: EvidenceCategory;

  @Column()
  filePath: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  amount: number;

  @ManyToOne(() => Task, (task) => task.evidences)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ name: 'task_id' })
  taskId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy: User;

  @Column({ name: 'uploaded_by' })
  uploadedById: string;

  @CreateDateColumn()
  createdAt: Date;
}
