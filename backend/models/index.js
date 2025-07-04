const { Sequelize } = require("sequelize");
const dbConfig = require("../config/db.config.js");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  },
  logging: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.products = require("./product.model.js")(sequelize, Sequelize);
db.productDetails = require("./productDetail.model.js")(sequelize, Sequelize);
db.productImages = require("./productImage.model.js")(sequelize, Sequelize);
db.productSizes = require("./productSize.model.js")(sequelize, Sequelize);
db.admins = require("./admin.model.js")(sequelize, Sequelize);

// Define relationships
db.products.hasMany(db.productDetails, { as: "details", foreignKey: "productId" });
db.productDetails.belongsTo(db.products, { foreignKey: "productId" });

db.products.hasMany(db.productImages, { as: "gallery", foreignKey: "productId" });
db.productImages.belongsTo(db.products, { foreignKey: "productId" });

db.products.hasMany(db.productSizes, { as: "sizes", foreignKey: "productId" });
db.productSizes.belongsTo(db.products, { foreignKey: "productId" });

module.exports = db;