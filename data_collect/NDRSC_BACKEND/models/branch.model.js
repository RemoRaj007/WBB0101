module.exports = (sequelize, DataTypes) => {
  const Branch = sequelize.define('Branch', {
    bank_name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    branch_name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    }
  }, {
    tableName: 'branches',
    timestamps: false,
    freezeTableName: true
  });
  return Branch;
};
