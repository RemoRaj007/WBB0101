const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Role = sequelize.define('Role', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'active'
        }
    }, {
        paranoid: true
    });

    return Role;
};
