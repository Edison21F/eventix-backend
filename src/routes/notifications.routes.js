const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/', notificationsController.getUserNotifications);
router.patch('/:id/read', notificationsController.markAsRead);
router.patch('/read-all', notificationsController.markAllAsRead);
router.delete('/:id', notificationsController.deleteNotification);

// Rutas de administrador
router.post('/bulk', requireRole('admin'), notificationsController.sendBulkNotifications);

module.exports = router;
