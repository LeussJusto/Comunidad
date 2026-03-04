import { ReportRepository } from '../infrastructure/repositories/ReportRepository';
import { TaskRepository } from '@modules/tasks/infrastructure/repositories/TaskRepository';
import { EvidenceRepository } from '@modules/tasks/infrastructure/repositories/EvidenceRepository';
import { PDFService } from './PDFService';
import { NotFoundError } from '@shared/errors';

interface GenerateEvidenceReportInput {
  taskId: string;
  generatedById: string;
}

export class GenerateEvidenceReportUseCase {
  private pdfService: PDFService;

  constructor(
    private reportRepository: ReportRepository,
    private taskRepository: TaskRepository,
    private evidenceRepository: EvidenceRepository
  ) {
    this.pdfService = new PDFService();
  }

  async execute(input: GenerateEvidenceReportInput) {
    const { taskId, generatedById } = input;

    // Validar que la tarea existe
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Tarea no encontrada');
    }

    // Obtener todas las evidencias de la tarea
    const evidences = await this.evidenceRepository.findByTask(taskId);

    // Generar el PDF
    const filePath = await this.pdfService.generateEvidenceReport(task, evidences);

    // Guardar el registro del reporte
    const report = await this.reportRepository.create({
      title: `Reporte de Evidencias: ${task.title}`,
      content: `Reporte de evidencias generado para la tarea "${task.title}" con ${evidences.length} archivos de evidencia.`,
      filePath,
      taskId,
      generatedById,
    });

    return report;
  }
}
