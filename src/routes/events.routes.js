const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/events.controller');
const notificationsController = require('../controllers/notifications.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const { validateEvent, validateSeatUpdate } = require('../validations/event.validation');

// Rutas públicas
router.get('/', eventsController.getEvents);
router.get('/:id', eventsController.getEventById);
router.post('/search', eventsController.searchEvents);

// Rutas protegidas (requieren autenticación)
router.use(authenticateToken);

// Rutas de administrador
router.post('/', requireRole('admin'), validateEvent, eventsController.createEvent);
router.put('/:id', requireRole('admin'), validateEvent, eventsController.updateEvent);
router.delete('/:id', requireRole('admin'), eventsController.deleteEvent);
router.get('/:id/analytics', requireRole('admin'), eventsController.getEventAnalytics);
router.patch('/:id/seats', requireRole('admin'), validateSeatUpdate, eventsController.updateSeatAvailability);

module.exports = router;