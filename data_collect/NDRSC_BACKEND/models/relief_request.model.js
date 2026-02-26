const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ReliefRequest = sequelize.define('ReliefRequest', {
        // Identification
        gnId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        gnDivision: {
            type: DataTypes.STRING,
            allowNull: true
        },
        dsDivision: {
            type: DataTypes.STRING,
            allowNull: true
        },
        district: {
            type: DataTypes.STRING,
            allowNull: true // Allow null for existing records, should be populated for new ones
        },
        householdId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        censusBlock: {
            type: DataTypes.STRING,
            allowNull: true
        },
        censusUnit: {
            type: DataTypes.STRING,
            allowNull: true
        },

        // Incident
        incidentType: {
            type: DataTypes.STRING, // Flood, Drought, etc.
            allowNull: true
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },

        // Property
        ownershipStatus: {
            type: DataTypes.STRING, // Owner, Tenant, Unauthorized
            allowNull: true
        },
        isEstate: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        // Damage
        damageZone: {
            type: DataTypes.STRING, // Kitchen, House, Other (can be multiple, stored as comma-sep or JSON if simple string)
            // For simplicity in SQL, let's use String or JSON if DB supports. Let's use String for now.
            allowNull: true
        },
        damageSeverity: {
            type: DataTypes.STRING, // Partial, Full
            allowNull: true
        },

        // Relief
        reliefAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },

        // Banking Details
        bankName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        branchName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        accountHolder: {
            type: DataTypes.STRING,
            allowNull: true
        },
        accountNumber: {
            type: DataTypes.STRING,
            allowNull: true
        },
        accountNic: {
            type: DataTypes.STRING,
            allowNull: true
        },

        // Meta
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending'
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        isDuplicate: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        duplicateReason: {
            type: DataTypes.STRING,
            allowNull: true
        },
        dataEnteredBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        actionBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        assignedVolunteerId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        originalRequestId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'ReliefRequests',
                key: 'id'
            }
        }
    }, {
        tableName: 'ReliefRequests',
        paranoid: true
    });

    return ReliefRequest;
};
