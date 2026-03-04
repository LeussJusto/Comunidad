import { Request, Response, NextFunction } from 'express';
// import { GenerateEventReportUseCase } from '../application/GenerateEventReportUseCase';
// import { GenerateExpenseReportUseCase } from '../application/GenerateExpenseReportUseCase';
import { GenerateEvidenceReportUseCase } from '../application/GenerateEvidenceReportUseCase';
import { GenerateConsolidatedReportUseCase } from '../application/GenerateConsolidatedReportUseCase';
import { ReportRepository } from '../infrastructure/repositories/ReportRepository';
import { EventRepository } from '@modules/events/infrastructure/repositories/EventRepository';
import { TaskRepository } from '@modules/tasks/infrastructure/repositories/TaskRepository';
import { EvidenceRepository } from '@modules/tasks/infrastructure/repositories/EvidenceRepository';
import { AuthRequest } from '@shared/middlewares/auth';
import path from 'path';
import fs from 'fs';

const reportRepository = new ReportRepository();
const eventRepository = new EventRepository();
const taskRepository = new TaskRepository();
const evidenceRepository = new EvidenceRepository();

// NOTA: GenerateEventReportUseCase comentado porque depende de la relación Task-Event que fue eliminada
// const generateEventReportUseCase = new GenerateEventReportUseCase(
//   reportRepository,
//   eventRepository,
//   taskRepository
// );

// NOTA: GenerateExpenseReportUseCase comentado porque depende de Voucher que fue unificado con Evidence
// const generateExpenseReportUseCase = new GenerateExpenseReportUseCase(
//   reportRepository,
//   eventRepository,
//   evidenceRepository
// );

const generateEvidenceReportUseCase = new GenerateEvidenceReportUseCase(
  reportRepository,
  taskRepository,
  evidenceRepository
);

const generateConsolidatedReportUseCase = new GenerateConsolidatedReportUseCase(
  reportRepository,
  eventRepository
);

export class ReportController {
  /**
   * Generar reporte de evento con todas sus tareas
   * NOTA: Deshabilitado temporalmente - La relación Task-Event fue eliminada
   */
  async generateEventReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      return res.status(501).json({
        success: false,
        message: 'Funcionalidad temporalmente deshabilitada - La relación entre tareas y eventos fue eliminada',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generar reporte de gastos de un evento
   * NOTA: Deshabilitado temporalmente - Vouchers fueron unificados con Evidence
   */
  async generateExpenseReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      return res.status(501).json({
        success: false,
        message: 'Funcionalidad temporalmente deshabilitada - Los vouchers ahora son evidencias con category=VOUCHER',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generar reporte de evidencias de una tarea
   */
  async generateEvidenceReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;

      const report = await generateEvidenceReportUseCase.execute({
        taskId,
        generatedById: req.userId!,
      });

      res.status(201).json({
        success: true,
        message: 'Reporte de evidencias generado exitosamente',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generar reporte consolidado por rango de fechas
   */
  async generateConsolidatedReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.body;

      const report = await generateConsolidatedReportUseCase.execute({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        generatedById: req.userId!,
      });

      res.status(201).json({
        success: true,
        message: 'Reporte consolidado generado exitosamente',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener todos los reportes generados
   */
  async getAllReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reports = await reportRepository.findAll();

      res.json({
        success: true,
        data: reports,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener reportes generados por el usuario actual
   */
  async getMyReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reports = await reportRepository.findByUser(req.userId!);

      res.json({
        success: true,
        data: reports,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener un reporte por ID
   */
  async getReportById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await reportRepository.findById(req.params.id);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Reporte no encontrado',
        });
      }

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Descargar archivo PDF de un reporte
   */
  async downloadReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await reportRepository.findById(req.params.id);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Reporte no encontrado',
        });
      }

      if (!report.filePath || !fs.existsSync(report.filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Archivo del reporte no encontrado',
        });
      }

      const fileName = path.basename(report.filePath);
      res.download(report.filePath, fileName, (err) => {
        if (err) {
          console.error('Error al descargar reporte:', err);
          next(err);
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar un reporte
   */
  async deleteReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await reportRepository.findById(req.params.id);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Reporte no encontrado',
        });
      }

      // Eliminar archivo físico si existe
      if (report.filePath && fs.existsSync(report.filePath)) {
        fs.unlinkSync(report.filePath);
      }

      // Eliminar registro de la BD
      await reportRepository.delete(req.params.id);

      res.json({
        success: true,
        message: 'Reporte eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}
