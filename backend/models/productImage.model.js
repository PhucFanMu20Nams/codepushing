module.exports = (sequelize, DataTypes) => {
  const ProductImage = sequelize.define("product_image", {
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: true
  });

  return ProductImage;
};