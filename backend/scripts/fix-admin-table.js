const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const config = require('../config/db.config');

// Admin credentials
const ADMIN_USERNAME = 'Teekayyj';
const ADMIN_PASSWORD = 'AdminTuanKiet';

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function fixAdminTableAndCreateUser() {
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

    // Step 1: Modify the admins table to make email nullable
    console.log('Modifying admins table structure...');
    await sequelize.query('ALTER TABLE admins ALTER COLUMN email DROP NOT NULL');
    console.log('Email column constraint removed successfully');

    // Step 2: Hash the password for the new admin
    const hashedPassword = await hashPassword(ADMIN_PASSWORD);
    
    // Step 3: Check if the admin already exists
    const [admin] = await sequelize.query(
      'SELECT * FROM admins WHERE username = :username',
      {
        replacements: { username: ADMIN_USERNAME },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    // Step 4: Create or update the admin
    if (admin) {
      await sequelize.query(
        'UPDATE admins SET password = :password WHERE username = :username',
        {
          replacements: { 
            username: ADMIN_USERNAME,
            password: hashedPassword
          },
          type: Sequelize.QueryTypes.UPDATE
        }
      );
      console.log('Admin password updated successfully');
    } else {
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
      console.log('New admin created successfully');
    }

    console.log('\n✅ ADMIN CREDENTIALS:');
    console.log('------------------------');
    console.log(`Username: ${ADMIN_USERNAME}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('------------------------');
    console.log('Keep these credentials secure!');

    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

// Execute the function
fixAdminTableAndCreateUser()
  .then(success => {
    process.exit(success ? 0 : 1);
  });
