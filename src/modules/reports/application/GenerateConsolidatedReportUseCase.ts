import { ReportRepository } from '../infrastructure/repositories/ReportRepository';
import { EventRepository } from '@modules/events/infrastructure/repositories/EventRepository';
import { PDFService } from './PDFService';
import { ValidationError } from '@shared/errors';
import { Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

interface GenerateConsolidatedReportInput {
  startDate: Date;
  endDate: Date;
  generatedById: string;
}

export class GenerateConsolidatedReportUseCase {
  private pdfService: PDFService;

  constructor(
    private reportRepository: ReportRepository,
    private eventRepository: EventRepository
  ) {
    this.pdfService = new PDFService();
  }

  async execute(input: GenerateConsolidatedReportInput) {
    const { startDate, endDate, generatedById } = input;

    // Validar fechas
    if (!startDate || !endDate) {
      throw new ValidationError('Las fechas de inicio y fin son obligatorias');
    }

    if (startDate > endDate) {
      throw new ValidationError('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    // Obtener eventos en el rango de fechas
    const events = await this.eventRepository.findByDateRange(startDate, endDate);

    // Generar el PDF
    const filePath = await this.pdfService.generateConsolidatedReport(events, startDate, endDate);

    // Guardar el registro del reporte
    const report = await this.reportRepository.create({
      title: `Reporte Consolidado: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      content: `Reporte consolidado de ${events.length} eventos en el período especificado.`,
      filePath,
      generatedById,
    });

    return report;
  }
}
