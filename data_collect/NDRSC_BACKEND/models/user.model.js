const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        district: {
            type: DataTypes.STRING,
            allowNull: true // For ABAC 'user.district'
        },
        nic: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        enumeratorId: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        gnDivision: {
            type: DataTypes.STRING,
            allowNull: true
        },
        dsDivision: {
            type: DataTypes.STRING,
            allowNull: true
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: 'user'
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'active'
        }
    }, {
        paranoid: true
    });

    return User;
};
