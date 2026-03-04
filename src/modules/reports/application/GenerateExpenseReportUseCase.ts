import { ReportRepository } from '../infrastructure/repositories/ReportRepository';
import { EventRepository } from '@modules/events/infrastructure/repositories/EventRepository';
// import { VoucherRepository } from '@modules/tasks/infrastructure/repositories/VoucherRepository';
import { EvidenceRepository } from '@modules/tasks/infrastructure/repositories/EvidenceRepository';
import { PDFService } from './PDFService';
import { NotFoundError } from '@shared/errors';
import { EvidenceCategory } from '@shared/enums';

interface GenerateExpenseReportInput {
  eventId: string;
  generatedById: string;
}

export class GenerateExpenseReportUseCase {
  private pdfService: PDFService;

  constructor(
    private reportRepository: ReportRepository,
    private eventRepository: EventRepository,
    private evidenceRepository: EvidenceRepository
  ) {
    this.pdfService = new PDFService();
  }

  async execute(input: GenerateExpenseReportInput) {
    const { eventId, generatedById } = input;

    // Validar que el evento existe
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Evento no encontrado');
    }

    // NOTA: Esta funcionalidad necesita re-diseño porque ahora los vouchers son evidencias
    // y las evidencias están relacionadas con tareas, no directamente con eventos
    // Por ahora retornamos un array vacío
    const vouchers: any[] = [];

    // Generar el PDF
    const filePath = await this.pdfService.generateExpenseReport(event, vouchers);

    // Calcular total
    const totalAmount = vouchers.reduce((sum: number, v: any) => sum + (v.amount || 0), 0);

    // Guardar el registro del reporte
    const report = await this.reportRepository.create({
      title: `Reporte de Gastos: ${event.title}`,
      content: `Reporte de gastos generado para el evento "${event.title}". Total: S/ ${totalAmount.toFixed(2)} en ${vouchers.length} comprobantes.`,
      filePath,
      eventId,
      generatedById,
    });

    return report;
  }
}
