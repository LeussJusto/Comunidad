import { EvidenceRepository } from '../infrastructure/repositories/EvidenceRepository';
import { TaskRepository } from '../infrastructure/repositories/TaskRepository';
import { ValidationError, NotFoundError } from '@shared/errors';
import { EvidenceType, EvidenceCategory } from '@shared/enums';

interface UploadEvidenceInput {
  taskId: string;
  uploadedById: string;
  type: EvidenceType;
  category: EvidenceCategory;
  filePath: string;
  description?: string;
  amount?: number;
}

export class UploadEvidenceUseCase {
  constructor(
    private evidenceRepository: EvidenceRepository,
    private taskRepository: TaskRepository
  ) {}

  async execute(input: UploadEvidenceInput) {
    const { taskId, uploadedById, type, category, filePath, description, amount } = input;

    // Validar que la tarea existe
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Tarea no encontrada');
    }

    // Validar que el usuario tiene permiso (es el asignado a la tarea)
    if (task.assignedToId !== uploadedById) {
      throw new ValidationError('No tienes permiso para subir evidencias a esta tarea');
    }

    // Crear la evidencia
    const evidence = await this.evidenceRepository.create({
      taskId,
      uploadedById,
      type,
      category,
      filePath,
      description,
      amount,
    });

    return evidence;
  }
}
