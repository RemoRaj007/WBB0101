module.exports = (sequelize, DataTypes) => {
    const ABACPolicy = sequelize.define("ABACPolicy", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        resource: {
            type: DataTypes.STRING, // e.g., 'page:user_management', 'api:users'
            allowNull: false
        },
        action: {
            type: DataTypes.STRING, // e.g., 'read', 'create', '*', 'approve'
            allowNull: false
        },
        subject: {
            type: DataTypes.JSON, // JSON object defining required user attributes e.g., { role: 'National Officer' }
            allowNull: true
        },
        effect: {
            type: DataTypes.ENUM('ALLOW', 'DENY'),
            defaultValue: 'ALLOW'
        },
        priority: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    });

    return ABACPolicy;
};
