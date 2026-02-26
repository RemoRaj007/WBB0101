const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const GNUID = sequelize.define('GNUID', {
        oldName: {
            field: 'GND_N_OLD',
            type: DataTypes.STRING,
            allowNull: true
        },
        district: {
            field: 'A1_Distr_1',
            type: DataTypes.STRING,
            allowNull: true
        },
        dsDivision: {
            field: 'A2_DSDiv_1',
            type: DataTypes.STRING,
            allowNull: true
        },
        gnDivision: {
            field: 'GND_N_N',
            type: DataTypes.STRING,
            allowNull: true
        },
        gnNumber: {
            field: 'GND_NU_N',
            type: DataTypes.STRING,
            allowNull: true
        },
        gnUid: {
            field: 'GND_UID_N',
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        }
    }, {
        tableName: 'gnuid',
        timestamps: false
    });

    return GNUID;
};
