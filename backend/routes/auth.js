const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register - Register admin (first time setup)
router.post('/register', authController.register);

// POST /api/auth/login - Login admin
router.post('/login', authController.login);

// GET /api/auth/profile - Get admin profile (protected)
router.get('/profile', authController.verifyToken, authController.getProfile);

module.exports = router;
