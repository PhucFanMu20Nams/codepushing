require('dotenv').config();

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/textura_db",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "24h"
};