const bcrypt = require('bcryptjs');
const db = require('../models');

// Admin user details - Custom admin account
const ADMIN_USERNAME = 'Teekayyj';
const ADMIN_PASSWORD = 'AdminTuanKiet';

async function createAdminUser() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connection established');

    // Check if admin already exists
    const existingAdmin = await db.admins.findOne({
      where: { username: ADMIN_USERNAME }
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);

    // Create admin user
    await db.admins.create({
      username: ADMIN_USERNAME,
      password: hashedPassword,
      isActive: true
    });

    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
