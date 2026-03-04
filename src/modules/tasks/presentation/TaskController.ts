import { Request, Response, NextFunction } from 'express';
import { CreateTaskUseCase } from '../application/CreateTaskUseCase';
import { UploadEvidenceUseCase } from '../application/UploadEvidenceUseCase';
import { TaskRepository } from '../infrastructure/repositories/TaskRepository';
import { EvidenceRepository } from '../infrastructure/repositories/EvidenceRepository';
import { NotificationService } from '@modules/notifications/application/NotificationService';
import { NotificationRepository } from '@modules/notifications/infrastructure/repositories/NotificationRepository';
import { AuthRequest } from '@shared/middlewares/auth';
import { TaskStatus, EvidenceType, EvidenceCategory } from '@shared/enums';
import fs from 'fs';
import path from 'path';

const taskRepository = new TaskRepository();
const evidenceRepository = new EvidenceRepository();
const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);
const createTaskUseCase = new CreateTaskUseCase(taskRepository);
const uploadEvidenceUseCase = new UploadEvidenceUseCase(evidenceRepository, taskRepository);

export class TaskController {
  async createTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await createTaskUseCase.execute({
        ...req.body,
        createdById: req.userId!,
      });
      res.status(201).json({
        success: true,
        message: 'Tarea creada exitosamente',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tasks = await taskRepository.findAll();
      res.json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tasks = await taskRepository.findByUser(req.userId!);
      res.json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskRepository.findById(req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tarea no encontrada',
        });
      }
      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTaskStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const updateData: any = { status };

      if (status === TaskStatus.COMPLETED) {
        updateData.completedAt = new Date();
      }

      const result = await taskRepository.update(req.params.id, updateData);
      
      // Notificar si la tarea se completó
      if (status === TaskStatus.COMPLETED && result) {
        const task = await taskRepository.findById(req.params.id);
        if (task && task.createdById) {
          await notificationService.notifyTaskCompleted(
            task.id,
            task.title,
            [task.createdById]
          );
        }
      }
      
      res.json({
        success: true,
        message: 'Estado de tarea actualizado',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadEvidence(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ningún archivo',
        });
      }

      const taskId = req.params.id; // taskId viene de la URL /tasks/:id/evidence
      const { description, amount, category } = req.body;
      
      console.log('📤 Upload Evidence Request:', { 
        taskId, 
        category, 
        description, 
        amount,
        filePath: req.file.path,
        uploadedById: req.userId 
      });

      let type: EvidenceType;

      // Determinar tipo basado en mimetype
      if (req.file.mimetype.startsWith('image/')) {
        type = EvidenceType.PHOTO;
      } else if (req.file.mimetype.startsWith('audio/')) {
        type = EvidenceType.AUDIO;
      } else if (req.file.mimetype.startsWith('video/')) {
        type = EvidenceType.VIDEO;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Tipo de archivo no soportado. Solo se permiten imágenes, audio y video.',
        });
      }

      const result = await uploadEvidenceUseCase.execute({
        taskId,
        uploadedById: req.userId!,
        type,
        category,
        filePath: req.file.path,
        description,
        amount: amount ? parseFloat(amount) : undefined,
      });

      console.log('✅ Evidence created successfully:', result.id);

      res.status(201).json({
        success: true,
        message: 'Evidencia subida exitosamente',
        data: result,
      });
    } catch (error) {
      console.error('❌ Error uploading evidence:', error);
      next(error);
    }
  }

  async getTaskEvidences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const evidences = await evidenceRepository.findByTask(req.params.id);
      res.json({
        success: true,
        data: evidences,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskVouchers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Ahora los vouchers son evidencias con category='VOUCHER'
      const allEvidences = await evidenceRepository.findByTask(req.params.id);
      const vouchers = allEvidences.filter(e => e.category === EvidenceCategory.VOUCHER);
      const total = vouchers.reduce((sum, v) => sum + (parseFloat(v.amount?.toString() || '0')), 0);
      res.json({
        success: true,
        data: {
          vouchers,
          total,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await taskRepository.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Tarea actualizada',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const taskId = req.params.id;
      
      // Obtener las evidencias antes de eliminarlas para borrar archivos
      const evidences = await evidenceRepository.findByTask(taskId);
      
      // Eliminar archivos físicos
      for (const evidence of evidences) {
        try {
          const filePath = path.join(__dirname, '../../../..', evidence.filePath);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Archivo eliminado: ${evidence.filePath}`);
          }
        } catch (fileError) {
          console.error(`⚠️ Error al eliminar archivo ${evidence.filePath}:`, fileError);
          // Continuar aunque falle la eliminación del archivo
        }
      }
      
      // Eliminar evidencias de la base de datos
      await evidenceRepository.deleteByTaskId(taskId);
      
      // Eliminar notificaciones asociadas
      await notificationService.deleteNotificationsByTaskId(taskId);
      
      // Finalmente eliminar la tarea
      await taskRepository.delete(taskId);
      
      console.log(`✅ Tarea ${taskId} eliminada exitosamente`);
      
      res.json({
        success: true,
        message: 'Tarea eliminada exitosamente',
      });
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      next(error);
    }
  }
}
