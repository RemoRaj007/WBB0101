const { Parser } = require('expr-eval');
const get = require('lodash/get');

const situational_check = (rule) => {
    return (req, res, next) => {
        const { resource, action } = req.query;

        // Specific requirement: Deny if 'resource' or 'action' query is missing
        if (!resource || !action) {
            return res.status(400).json({ message: 'Missing resource or action identifier in query' });
        }

        // In a real scenario, we might fetch the actual resource from DB here based on ID
        // For this demo, we assume 'req.resource' might be populated by a previous middleware
        // OR we use the query params and user context to evaluate the rule directly.

        // Example Rule: "user.district == resource.district"
        // We need a context object to evaluate against.

        const context = {
            user: req.user,
            resource: req.resource || req.query, // Fallback to query if resource not loaded
            action: action
        };

        try {
            const parser = new Parser();
            const expr = parser.parse(rule);

            // To support lodash-like deep access in the expression if needed, 
            // expr-eval supports member access (user.district).
            // But if we wanted to be explicit with lodash, we'd pre-process, 
            // but expr-eval handles object properties well.

            const isAllowed = expr.evaluate(context);

            if (isAllowed) {
                next();
            } else {
                return res.status(403).json({ message: 'Situational Access Denied' });
            }
        } catch (error) {
            logger.error('ABAC Evaluation Error: ' + error.message);
            return res.status(500).json({ message: 'Access Evaluation Failed' });
        }
    };
};

module.exports = situational_check;
