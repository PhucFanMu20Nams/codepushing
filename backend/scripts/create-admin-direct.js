const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
const config = require('../config/db.config');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function createAdminDirectlyInDB() {
  console.log('Connecting to database...');
  const sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD,
    {
      host: config.HOST,
      dialect: config.dialect,
      port: config.PORT,
      logging: console.log
    }
  );

  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    // Set admin credentials
    const adminUsername = 'admin';
    const adminPassword = 'admin123'; // Simple password for testing
    
    // Hash the password
    const hashedPassword = await hashPassword(adminPassword);
    console.log(`Password "${adminPassword}" hashed to: ${hashedPassword}`);

    // Check if admin exists
    const [results] = await sequelize.query(
      'SELECT * FROM admins WHERE username = :username',
      {
        replacements: { username: adminUsername },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    if (results) {
      console.log('Admin already exists, updating password...');
      await sequelize.query(
        'UPDATE admins SET password = :password WHERE username = :username',
        {
          replacements: { password: hashedPassword, username: adminUsername },
          type: Sequelize.QueryTypes.UPDATE
        }
      );
      console.log('Admin password updated successfully');
    } else {
      console.log('Creating new admin account...');
      await sequelize.query(
        'INSERT INTO admins (username, password, "isActive") VALUES (:username, :password, true)',
        {
          replacements: { 
            username: adminUsername,
            password: hashedPassword
          },
          type: Sequelize.QueryTypes.INSERT
        }
      );
      console.log('Admin created successfully');
    }

    console.log('\n✅ ADMIN CREDENTIALS:');
    console.log('------------------------');
    console.log(`Username: ${adminUsername}`);
    console.log(`Password: ${adminPassword}`);
    console.log('------------------------');
    console.log('Keep these credentials secure!');

    return true;
  } catch (error) {
    console.error('Error creating admin:', error);
    return false;
  } finally {
    await sequelize.close();
  }
}

// Execute if this is the main module
if (require.main === module) {
  createAdminDirectlyInDB()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

module.exports = createAdminDirectlyInDB;
