const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('../config/db.config');

async function executeSqlFile() {
  // Create a new Sequelize instance
  const sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD,
    {
      host: config.HOST,
      dialect: config.dialect,
      port: config.PORT,
      logging: false // Set to console.log to see SQL queries
    }
  );

  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    console.log(`Connected to: ${config.DB} as ${config.USER} on ${config.HOST}:${config.PORT}`);

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../data/data.sql');
    console.log(`Reading SQL file from: ${sqlFilePath}`);
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error(`SQL file not found at: ${sqlFilePath}`);
      return false;
    }
    
    const sqlStatements = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute SQL as a transaction
    await sequelize.transaction(async (transaction) => {
      // Split SQL by semicolon to get individual statements
      // This is a simple implementation that won't handle all SQL edge cases
      const statements = sqlStatements
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);

      console.log(`Found ${statements.length} SQL statements to execute`);

      // Execute each statement
      for (let i = 0; i < statements.length; i++) {
        console.log(`Executing statement ${i + 1}/${statements.length}`);
        await sequelize.query(statements[i], { transaction });
      }
    });

    console.log('SQL file executed successfully');
    return true;
  } catch (error) {
    console.error('Error executing SQL file:', error);
    return false;
  } finally {
    // Close the connection
    await sequelize.close();
  }
}

// Execute if this is the main module
if (require.main === module) {
  executeSqlFile()
    .then(result => {
      console.log('SQL migration completed with status:', result);
      process.exit(result ? 0 : 1);
    })
    .catch(error => {
      console.error('SQL migration failed:', error);
      process.exit(1);
    });
}

module.exports = executeSqlFile;