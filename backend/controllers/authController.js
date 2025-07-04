const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../models');
const authConfig = require('../config/auth.config');

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_ATTEMPTS',
      message: 'Too many login attempts, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register admin (for initial setup only)
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await db.admins.findOne({
      where: { username }
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ADMIN_EXISTS',
          message: 'Admin already exists'
        }
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin
    const admin = await db.admins.create({
      username,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      data: {
        message: 'Admin registered successfully',
        adminId: admin.id
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_ERROR',
        message: 'Error registering admin'
      }
    });
  }
};

// Login admin
exports.login = [authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Username and password are required'
        }
      });
    }

    // Find admin
    console.log('Login attempt:', { username });
    
    const admin = await db.admins.findOne({
      where: { username }
    });

    console.log('Admin found:', admin ? admin.username : 'none');

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password'
        }
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password'
        }
      });
    }

    // Update last login
    await admin.update({ lastLogin: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        username: admin.username
      },
      authConfig.JWT_SECRET,
      { expiresIn: authConfig.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          lastLogin: admin.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_ERROR',
        message: 'Error during login'
      }
    });
  }
}];

// Verify token middleware
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'NO_TOKEN',
        message: 'Access token is required'
      }
    });
  }

  try {
    const decoded = jwt.verify(token, authConfig.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
  }
};

// Get admin profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await db.admins.findByPk(req.admin.adminId, {
      attributes: ['id', 'username', 'lastLogin', 'createdAt']
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ADMIN_NOT_FOUND',
          message: 'Admin not found'
        }
      });
    }

    res.json({
      success: true,
      data: { admin }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROFILE_ERROR',
        message: 'Error fetching profile'
      }
    });
  }
};
