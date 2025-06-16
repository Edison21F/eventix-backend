const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/dashboard', analyticsController.getDashboardMetrics);
router.get('/top-events', analyticsController.getTopEvents);
router.get('/reports/weekly/:eventId', analyticsController.getWeeklyReport);
router.post('/record/page-view', analyticsController.recordPageView);

module.exports = router;