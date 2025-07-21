const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login - Login admin
router.post('/login', authController.loginAdmin);

// GET /api/auth/verify - Verify token
router.get('/verify', authController.verifyToken);

module.exports = router;
