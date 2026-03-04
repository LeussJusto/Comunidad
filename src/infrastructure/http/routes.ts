import { Router } from 'express';
import authRoutes from '@modules/auth/presentation/routes';
import userRoutes from '@modules/users/presentation/routes';
import eventRoutes from '@modules/events/presentation/routes';
import taskRoutes from '@modules/tasks/presentation/routes';
import notificationRoutes from '@modules/notifications/presentation/routes';
import reportRoutes from '@modules/reports/infrastructure/routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sistema Municipal API' });
});

// Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/tasks', taskRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);

export default router;
