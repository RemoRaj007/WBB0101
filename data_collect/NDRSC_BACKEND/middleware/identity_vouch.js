const jwt = require('jsonwebtoken');

const identity_vouch = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Token Required' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid or Expired Token' });
        }
        req.user = user;
        next();
    });
};

module.exports = identity_vouch;
