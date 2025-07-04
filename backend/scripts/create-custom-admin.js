const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
const config = require('../config/db.config');

// Admin credentials you want to set
const ADMIN_USERNAME = 'Teekayyj';
const ADMIN_PASSWORD = 'AdminTuanKiet';
const ADMIN_EMAIL = 'teekayyj@textura.com'; // Adding default email

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function createCustomAdmin() {
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

    // Hash the password
    const hashedPassword = await hashPassword(ADMIN_PASSWORD);
    console.log(`Password "${ADMIN_PASSWORD}" hashed to: ${hashedPassword}`);

    // Check if admin already exists
    const [admin] = await sequelize.query(
      'SELECT * FROM admins WHERE username = :username',
      {
        replacements: { username: ADMIN_USERNAME },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    if (admin) {
      // Update existing admin
      console.log('Admin already exists, updating password...');
      await sequelize.query(
        'UPDATE admins SET password = :password WHERE username = :username',
        {
          replacements: { password: hashedPassword, username: ADMIN_USERNAME },
          type: Sequelize.QueryTypes.UPDATE
        }
      );
      console.log('Admin password updated successfully');
    } else {
      // Create new admin
      console.log('Creating new admin account...');
      await sequelize.query(
        'INSERT INTO admins (username, password, "isActive") VALUES (:username, :password, true)',
        {
          replacements: { 
            username: ADMIN_USERNAME,
            password: hashedPassword
          },
          type: Sequelize.QueryTypes.INSERT
        }
      );
      console.log('Admin created successfully');
    }

    console.log('\n✅ ADMIN CREDENTIALS:');
    console.log('------------------------');
    console.log(`Username: ${ADMIN_USERNAME}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
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

// Run the script
createCustomAdmin()
  .then(success => {
    process.exit(success ? 0 : 1);
  });
