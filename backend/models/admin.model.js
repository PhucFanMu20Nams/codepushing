module.exports = (sequelize, Sequelize) => {
  const Admin = sequelize.define("admin", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    password: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    lastLogin: {
      type: Sequelize.DATE,
      allowNull: true
    }
  }, {
    tableName: 'admins',
    timestamps: true
  });

  return Admin;
};
