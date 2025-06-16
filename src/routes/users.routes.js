const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// Rutas protegidas
router.use(authenticateToken);

router.get('/profile', usersController.getProfile);
router.put('/profile', usersController.updateProfile);
router.get('/:id/tickets', usersController.getUserTickets);

// Rutas de administrador
router.get('/', requireRole('admin'), usersController.getAllUsers);
router.delete('/:id', requireRole('admin'), usersController.deleteUser);

module.exports = router;