const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

/**
 * Role-Based Access Control Middleware
 * @param {Array<string>} allowedRoles - List of roles that are allowed to access the route
 */
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized: No user found' });
            }

            // Super User bypass (optional, but good practice for admins)
            if (req.user.role === 'Super User') {
                return next();
            }

            if (allowedRoles.includes(req.user.role)) {
                return next();
            } else {
                return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
            }
        } catch (error) {
            logger.error('RBAC Error: ' + error.message);
            res.status(500).json({ message: 'Internal Server Error during role check' });
        }
    };
};

module.exports = checkRole;
