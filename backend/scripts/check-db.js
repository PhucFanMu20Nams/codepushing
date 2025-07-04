const { Sequelize } = require('sequelize');
const config = require('../config/db.config');

async function checkDatabaseConnection() {
  console.log('Database configuration:', {
    host: config.HOST,
    port: config.PORT,
    database: config.DB,
    user: config.USER,
    // Password is hidden for security
  });
  
  const sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD,
    {
      host: config.HOST,
      dialect: config.dialect,
      port: config.PORT,
      logging: false
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully!');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    console.log('\nPossible solutions:');
    console.log('1. Make sure PostgreSQL is installed and running');
    console.log('2. Verify your username and password in the .env file');
    console.log('3. Check if the database exists: CREATE DATABASE textura_db;');
    console.log('4. Check if the PostgreSQL server is listening on the correct port');
    return false;
  } finally {
    await sequelize.close();
  }
}

checkDatabaseConnection().then(success => {
  process.exit(success ? 0 : 1);
});
