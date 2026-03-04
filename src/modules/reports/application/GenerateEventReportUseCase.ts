import { ReportRepository } from '../infrastructure/repositories/ReportRepository';
import { EventRepository } from '@modules/events/infrastructure/repositories/EventRepository';
import { TaskRepository } from '@modules/tasks/infrastructure/repositories/TaskRepository';
import { PDFService } from './PDFService';
import { NotFoundError, ValidationError } from '@shared/errors';

interface GenerateEventReportInput {
  eventId: string;
  generatedById: string;
}

export class GenerateEventReportUseCase {
  private pdfService: PDFService;

  constructor(
    private reportRepository: ReportRepository,
    private eventRepository: EventRepository,
    private taskRepository: TaskRepository
  ) {
    this.pdfService = new PDFService();
  }

  async execute(input: GenerateEventReportInput) {
    const { eventId, generatedById } = input;

    // Validar que el evento existe
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Evento no encontrado');
    }

    // NOTA: La relación entre Task y Event fue eliminada
    // Por ahora generamos el reporte solo con información del evento
    const tasks: any[] = [];

    // Generar el PDF
    const filePath = await this.pdfService.generateEventReport(event, tasks);

    // Guardar el registro del reporte
    const report = await this.reportRepository.create({
      title: `Reporte de Evento: ${event.title}`,
      content: `Reporte generado para el evento "${event.title}".`,
      filePath,
      eventId,
      generatedById,
    });

    return report;
  }
}
