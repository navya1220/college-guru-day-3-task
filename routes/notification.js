
import express from 'express';
import { getNotifications, markAsRead, deleteNotification } from '../controllers/notificationController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateJWT, getNotifications);
router.put('/:id/read', authenticateJWT, markAsRead);
router.delete('/:id', authenticateJWT, deleteNotification);

export default router;
