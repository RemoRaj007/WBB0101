const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Resource = sequelize.define('Resource', {
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        district: {
            type: DataTypes.STRING, // For ABAC 'resource.district'
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('available', 'deployed', 'maintenance', 'inactive'),
            defaultValue: 'available'
        }
    }, {
        paranoid: true
    });

    return Resource;
};
