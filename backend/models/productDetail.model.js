module.exports = (sequelize, DataTypes) => {
  const ProductDetail = sequelize.define("product_detail", {
    detail: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    timestamps: true
  });

  return ProductDetail;
};