// filepath: backend/models/index.js
const mongoose = require('mongoose');
const config = require('../config/db.config');

mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;
db.url = config.MONGODB_URI;

// Add your models here
db.Product = require('./Product.js');
db.Admin = require('./Admin.js');

// Function to connect to the database
db.connectDB = async () => {
  await mongoose.connect(db.url);
};

module.exports = db;