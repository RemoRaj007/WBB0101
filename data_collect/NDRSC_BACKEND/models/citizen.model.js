const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Citizen = sequelize.define('Citizen', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        nic: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        gnDivision: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dsDivision: {
            type: DataTypes.STRING,
            allowNull: false
        },
        district: {
            type: DataTypes.STRING,
            allowNull: false
        },
        scannedFormImage: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending', // pending, approved, rejected
            validate: {
                isIn: [['pending', 'approved', 'rejected']]
            }
        },
        dataEnteredBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        }
    }, {
        paranoid: true
    });

    return Citizen;
};
