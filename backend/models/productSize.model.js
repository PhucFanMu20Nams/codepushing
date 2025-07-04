module.exports = (sequelize, DataTypes) => {
  const ProductSize = sequelize.define("product_size", {
    size: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: true
  });

  return ProductSize;
};