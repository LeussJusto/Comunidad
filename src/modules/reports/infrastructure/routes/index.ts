import { Router } from 'express';
import { ReportController } from '../../presentation/ReportController';
import { authenticate, authorize } from '@shared/middlewares/auth';
import { UserRole } from '@shared/enums';

const router = Router();
const controller = new ReportController();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route POST /api/v1/reports/event/:eventId
 * @desc Generar reporte de evento
 * @access Presidente, Tesorero, Staff
 */
router.post(
  '/event/:eventId',
  authorize(UserRole.PRESIDENT, UserRole.TREASURER, UserRole.STAFF),
  controller.generateEventReport.bind(controller)
);

/**
 * @route POST /api/v1/reports/expense/:eventId
 * @desc Generar reporte de gastos de un evento
 * @access Presidente, Tesorero
 */
router.post(
  '/expense/:eventId',
  authorize(UserRole.PRESIDENT, UserRole.TREASURER),
  controller.generateExpenseReport.bind(controller)
);

/**
 * @route POST /api/v1/reports/evidence/:taskId
 * @desc Generar reporte de evidencias de una tarea
 * @access Presidente, Staff, Secretary
 */
router.post(
  '/evidence/:taskId',
  authorize(UserRole.PRESIDENT, UserRole.STAFF, UserRole.SECRETARY),
  controller.generateEvidenceReport.bind(controller)
);

/**
 * @route POST /api/v1/reports/consolidated
 * @desc Generar reporte consolidado por rango de fechas
 * @access Presidente, Tesorero
 * @body { startDate: Date, endDate: Date }
 */
router.post(
  '/consolidated',
  authorize(UserRole.PRESIDENT, UserRole.TREASURER),
  controller.generateConsolidatedReport.bind(controller)
);

/**
 * @route GET /api/v1/reports
 * @desc Obtener todos los reportes
 * @access Presidente, Tesorero, Staff
 */
router.get(
  '/',
  authorize(UserRole.PRESIDENT, UserRole.TREASURER, UserRole.STAFF),
  controller.getAllReports.bind(controller)
);

/**
 * @route GET /api/v1/reports/my
 * @desc Obtener reportes generados por el usuario actual
 * @access Todos los autenticados
 */
router.get('/my', controller.getMyReports.bind(controller));

/**
 * @route GET /api/v1/reports/:id
 * @desc Obtener un reporte por ID
 * @access Todos los autenticados
 */
router.get('/:id', controller.getReportById.bind(controller));

/**
 * @route GET /api/v1/reports/:id/download
 * @desc Descargar PDF de un reporte
 * @access Todos los autenticados
 */
router.get('/:id/download', controller.downloadReport.bind(controller));

/**
 * @route DELETE /api/v1/reports/:id
 * @desc Eliminar un reporte
 * @access Presidente, Tesorero
 */
router.delete(
  '/:id',
  authorize(UserRole.PRESIDENT, UserRole.TREASURER),
  controller.deleteReport.bind(controller)
);

export default router;
