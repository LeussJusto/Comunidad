import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { Event } from '@modules/events/infrastructure/entities/Event';
import { Task } from '@modules/tasks/infrastructure/entities/Task';
import { Evidence } from '@modules/tasks/infrastructure/entities/Evidence';

export class PDFService {
  private uploadsDir = path.join(process.cwd(), 'uploads', 'reports');

  constructor() {
    // Crear directorio si no existe
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Genera un reporte PDF de un evento con todas sus tareas
   */
  async generateEventReport(event: Event, tasks: Task[]): Promise<string> {
    const fileName = `reporte-evento-${event.id}-${Date.now()}.pdf`;
    const filePath = path.join(this.uploadsDir, fileName);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Encabezado
      doc.fontSize(20).text('REPORTE DE EVENTO', { align: 'center' });
      doc.moveDown();

      // Información del evento
      doc.fontSize(14).text('Información General', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.text(`Título: ${event.title}`);
      doc.text(`Tipo: ${event.type}`);
      doc.text(`Prioridad: ${event.priority}`);
      doc.text(`Fecha programada: ${new Date(event.scheduledDate).toLocaleDateString()}`);
      if (event.location) doc.text(`Ubicación: ${event.location}`);
      doc.moveDown();
      doc.text(`Descripción: ${event.description}`);
      doc.moveDown(1.5);

      // Tareas asociadas
      doc.fontSize(14).text('Tareas Asociadas', { underline: true });
      doc.moveDown(0.5);

      if (tasks.length === 0) {
        doc.fontSize(10).text('No hay tareas asociadas a este evento.');
      } else {
        tasks.forEach((task, index) => {
          doc.font('Helvetica-Bold').fontSize(12).text(`${index + 1}. ${task.title}`);
          doc.font('Helvetica').fontSize(10);
          doc.text(`   Estado: ${task.status}`);
          doc.text(`   Asignado a: ${task.assignedTo?.name || 'N/A'}`);
          if (task.scheduledDate) {
            doc.text(`   Fecha: ${new Date(task.scheduledDate).toLocaleDateString()}`);
          }
          if (task.completedAt) {
            doc.text(`   Completado: ${new Date(task.completedAt).toLocaleDateString()}`);
          }
          doc.text(`   Descripción: ${task.description}`);
          doc.moveDown(0.5);
        });
      }

      doc.moveDown(1.5);

      // Pie de página
      const currentDate = new Date().toLocaleString('es-ES');
      doc.fontSize(8).text(`Generado el: ${currentDate}`, { align: 'right' });

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }

  /**
   * Genera un reporte PDF de gastos/vouchers de un evento
   */
  async generateExpenseReport(event: Event, vouchers: Evidence[]): Promise<string> {
    const fileName = `reporte-gastos-${event.id}-${Date.now()}.pdf`;
    const filePath = path.join(this.uploadsDir, fileName);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Encabezado
      doc.fontSize(20).text('REPORTE DE GASTOS', { align: 'center' });
      doc.moveDown();

      // Información del evento
      doc.fontSize(14).text('Evento', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.text(`Título: ${event.title}`);
      doc.text(`Fecha: ${new Date(event.scheduledDate).toLocaleDateString()}`);
      doc.moveDown(1.5);

      // Tabla de gastos
      doc.fontSize(14).text('Detalle de Gastos', { underline: true });
      doc.moveDown(0.5);

      if (vouchers.length === 0) {
        doc.fontSize(10).text('No se han registrado gastos para este evento.');
      } else {
        let totalAmount = 0;

        // Encabezados de tabla
        doc.fontSize(10);
        const tableTop = doc.y;
        const col1 = 50;
        const col2 = 200;
        const col3 = 400;
        const col4 = 500;

        doc.text('Fecha', col1, tableTop, { width: 140 });
        doc.text('Descripción', col2, tableTop, { width: 190 });
        doc.text('Responsable', col3, tableTop, { width: 90 });
        doc.text('Monto', col4, tableTop, { width: 50, align: 'right' });

        doc.moveDown();
        doc.moveTo(col1, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Filas de datos
        vouchers.forEach((voucher) => {
          const y = doc.y;
          doc.text(new Date(voucher.createdAt).toLocaleDateString(), col1, y, { width: 140 });
          doc.text(voucher.description, col2, y, { width: 190 });
          doc.text(voucher.uploadedBy?.name || 'N/A', col3, y, { width: 90 });
          doc.text(`S/ ${voucher.amount.toFixed(2)}`, col4, y, { width: 50, align: 'right' });
          doc.moveDown();

          totalAmount += voucher.amount;
        });

        doc.moveDown(0.5);
        doc.moveTo(col1, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Total
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('TOTAL:', col3, doc.y, { width: 90 });
        doc.text(`S/ ${totalAmount.toFixed(2)}`, col4, doc.y, { width: 50, align: 'right' });
      }

      doc.moveDown(2);

      // Pie de página
      const currentDate = new Date().toLocaleString('es-ES');
      doc.fontSize(8).font('Helvetica').text(`Generado el: ${currentDate}`, { align: 'right' });

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }

  /**
   * Genera un reporte PDF de evidencias de una tarea
   */
  async generateEvidenceReport(task: Task, evidences: Evidence[]): Promise<string> {
    const fileName = `reporte-evidencias-${task.id}-${Date.now()}.pdf`;
    const filePath = path.join(this.uploadsDir, fileName);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Encabezado
      doc.fontSize(20).text('REPORTE DE EVIDENCIAS', { align: 'center' });
      doc.moveDown();

      // Información de la tarea
      doc.fontSize(14).text('Tarea', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.text(`Título: ${task.title}`);
      doc.text(`Estado: ${task.status}`);
      doc.text(`Asignado a: ${task.assignedTo?.name || 'N/A'}`);
      doc.moveDown();
      doc.text(`Descripción: ${task.description}`);
      doc.moveDown(1.5);

      // Evidencias
      doc.fontSize(14).text('Evidencias Registradas', { underline: true });
      doc.moveDown(0.5);

      if (evidences.length === 0) {
        doc.fontSize(10).text('No se han registrado evidencias para esta tarea.');
      } else {
        evidences.forEach((evidence, index) => {
          doc.font('Helvetica-Bold').fontSize(12).text(`${index + 1}. ${evidence.type}`);
          doc.font('Helvetica').fontSize(10);
          doc.text(`   Fecha: ${new Date(evidence.createdAt).toLocaleDateString()}`);
          doc.text(`   Subido por: ${evidence.uploadedBy?.name || 'N/A'}`);
          doc.text(`   Descripción: ${evidence.description || 'Sin descripción'}`);
          doc.text(`   Archivo: ${path.basename(evidence.filePath)}`);
          doc.moveDown(0.5);
        });
      }

      doc.moveDown(1.5);

      // Pie de página
      const currentDate = new Date().toLocaleString('es-ES');
      doc.fontSize(8).text(`Generado el: ${currentDate}`, { align: 'right' });

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }

  /**
   * Genera un reporte consolidado de todos los eventos en un rango de fechas
   */
  async generateConsolidatedReport(
    events: Event[],
    startDate: Date,
    endDate: Date
  ): Promise<string> {
    const fileName = `reporte-consolidado-${Date.now()}.pdf`;
    const filePath = path.join(this.uploadsDir, fileName);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Encabezado
      doc.fontSize(20).text('REPORTE CONSOLIDADO', { align: 'center' });
      doc.moveDown();

      // Período
      doc.fontSize(12);
      doc.text(
        `Período: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        { align: 'center' }
      );
      doc.moveDown(1.5);

      // Resumen
      doc.fontSize(14).text('Resumen Ejecutivo', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.text(`Total de eventos: ${events.length}`);
      doc.moveDown(1.5);

      // Lista de eventos
      doc.fontSize(14).text('Detalle de Eventos', { underline: true });
      doc.moveDown(0.5);

      events.forEach((event, index) => {
        doc.font('Helvetica-Bold').fontSize(11).text(`${index + 1}. ${event.title}`);
        doc.font('Helvetica').fontSize(9);
        doc.text(`   Tipo: ${event.type} | Prioridad: ${event.priority}`);
        doc.text(`   Fecha: ${new Date(event.scheduledDate).toLocaleDateString()}`);
        if (event.location) doc.text(`   Ubicación: ${event.location}`);
        doc.moveDown(0.3);
      });

      doc.moveDown(1.5);

      // Pie de página
      const currentDate = new Date().toLocaleString('es-ES');
      doc.fontSize(8).text(`Generado el: ${currentDate}`, { align: 'right' });

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }
}
