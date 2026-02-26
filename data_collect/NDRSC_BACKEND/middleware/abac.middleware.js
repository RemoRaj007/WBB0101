const logger = require('../utils/logger');
const { ABACPolicy, User } = require('../models');
const { Op } = require('sequelize');

/**
 * ABAC Middleware
 * @param {string} resource - The resource being accessed (e.g., 'user', 'report')
 * @param {string} action - The action being performed (e.g., 'read', 'create', 'update', 'delete')
 */
const checkAbac = (resource, action) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id; // Assuming auth middleware populates req.user
            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Super User Bypass
            if (user.role === 'Super User') {
                return next();
            }

            // Fetch applicable policies
            const policies = await ABACPolicy.findAll({
                where: {
                    resource: resource,
                    [Op.or]: [
                        { action: action },
                        { action: '*' } // Wildcard action
                    ],
                    effect: 'ALLOW'
                },
                order: [['priority', 'DESC']]
            });

            // If no allow policies found, strict deny
            if (policies.length === 0) {
                return res.status(403).json({ message: 'Access Denied: No policy allows this action.' });
            }

            // Evaluate policies
            let allowed = false;
            for (const policy of policies) {
                const subjectConstraints = policy.subject;
                let match = true;

                // Check if user attributes match the policy subject constraints
                if (subjectConstraints) {
                    for (const key in subjectConstraints) {
                        if (user[key] !== subjectConstraints[key]) {
                            match = false;
                            break;
                        }
                    }
                }

                if (match) {
                    allowed = true;
                    break;
                }
            }

            if (allowed) {
                next();
            } else {
                res.status(403).json({ message: 'Access Denied' });
            }

        } catch (error) {
            logger.error('ABAC Error: ' + error.message);
            res.status(500).json({ message: 'Internal Server Error during permission check' });
        }
    };
};

module.exports = checkAbac;
