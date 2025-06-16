const express = require('express');
const router = express.Router();

// Rutas de autenticación
router.use('/auth', require('./auth.routes'));

// Rutas de usuarios
router.use('/users', require('./users.routes'));

// Rutas de eventos (MongoDB)
router.use('/events', require('./events.routes'));

// Rutas de notificaciones (MongoDB)
router.use('/notifications', require('./notifications.routes'));

// Rutas de analytics (MongoDB)
router.use('/analytics', require('./analytics.routes'));

// Rutas de configuraciones (MongoDB)
router.use('/configurations', require('./configurations.routes'));

// Ruta de salud del API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;