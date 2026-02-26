const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ReliefRequestMedia = sequelize.define('ReliefRequestMedia', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        reliefRequestId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'ReliefRequests',
                key: 'id'
            }
        },
        fileUrl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fileType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        originalName: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'ReliefRequestMedia',
        timestamps: true
    });

    return ReliefRequestMedia;
};
