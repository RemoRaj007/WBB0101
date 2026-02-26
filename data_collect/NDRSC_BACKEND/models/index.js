const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        timezone: '+05:30', 
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: false
    }
);

const db = {
    Sequelize,
    sequelize
};


db.User = require('./user.model')(sequelize, Sequelize);
db.Role = require('./role.model')(sequelize, Sequelize);
db.ABACPolicy = require('./abac_policy.model')(sequelize, Sequelize);
db.Citizen = require('./citizen.model')(sequelize, Sequelize);
db.ReliefRequest = require('./relief_request.model')(sequelize, Sequelize);
db.VolunteerRequest = require('./volunteer_request.model')(sequelize, Sequelize);
db.Branch = require('./branch.model')(sequelize, Sequelize);
db.GNUID = require('./gnuid.model')(sequelize, Sequelize);


db.Role.hasMany(db.User, { foreignKey: 'roleId' });
db.User.belongsTo(db.Role, { foreignKey: 'roleId' });

db.User.hasMany(db.Citizen, { foreignKey: 'dataEnteredBy', as: 'enteredCitizens' });
db.Citizen.belongsTo(db.User, { foreignKey: 'dataEnteredBy', as: 'enumerator' });

db.User.hasMany(db.ReliefRequest, { foreignKey: 'dataEnteredBy', as: 'enteredReliefRequests' });
db.ReliefRequest.belongsTo(db.User, { foreignKey: 'dataEnteredBy', as: 'enumerator' });

db.User.hasMany(db.ReliefRequest, { foreignKey: 'actionBy', as: 'actionedReliefRequests' });
db.ReliefRequest.belongsTo(db.User, { foreignKey: 'actionBy', as: 'actioner' });

db.User.hasMany(db.ReliefRequest, { foreignKey: 'assignedVolunteerId', as: 'assignedReliefRequests' });
db.ReliefRequest.belongsTo(db.User, { foreignKey: 'assignedVolunteerId', as: 'assignedVolunteer' });

db.ReliefRequestMedia = require('./relief_request_media.model')(sequelize, Sequelize);
db.ReliefRequest.hasMany(db.ReliefRequestMedia, { foreignKey: 'reliefRequestId', as: 'media' });
db.ReliefRequestMedia.belongsTo(db.ReliefRequest, { foreignKey: 'reliefRequestId' });

module.exports = db;

