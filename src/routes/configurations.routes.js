const express = require('express');
const router = express.Router();
const configurationsController = require('../controllers/configurations.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/public', configurationsController.getPublicConfigurations);

// Rutas protegidas
router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/', configurationsController.getAllConfigurations);
router.get('/:key', configurationsController.getConfiguration);
router.put('/:key', configurationsController.setConfiguration);
router.get('/category/:category', configurationsController.getConfigurationsByCategory);

module.exports = router;