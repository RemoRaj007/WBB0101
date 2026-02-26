const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const VolunteerRequest = sequelize.define('VolunteerRequest', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        nic: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        enumeratorId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending' // 'pending', 'approved', 'rejected'
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        paranoid: true
    });

    return VolunteerRequest;
};
