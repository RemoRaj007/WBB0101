const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../models');
const authController = require('../../controllers/auth.controller');
const logger = require('../../utils/logger');
const validate = require('../../middleware/validate');
const { registerVolunteerSchema } = require('../../validators/auth.validator');


router.post('/register/un-volunteer', validate(registerVolunteerSchema), authController.registerUNVolunteer);


router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db.User.findOne({ where: { username } });
        if (!user) {
            logger.warn(`Failed login attempt for unknown user: ${username} from IP ${req.ip}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.status !== 'active') {
            logger.warn(`Login attempt for inactive account: ${username} from IP ${req.ip}`);
            return res.status(403).json({
                message: 'Your account is not approved yet. Please wait for admin approval.',
                status: user.status
            });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            logger.warn(`Failed login attempt for user: ${username} from IP ${req.ip}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Access token: short-lived (15 minutes)
        const accessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role, district: user.district },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        // Refresh token: longer-lived (7 days), stored in httpOnly cookie
        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        logger.info(`Successful login: ${username} from IP ${req.ip}`);
        res.json({ accessToken, user: { id: user.id, username: user.username, role: user.role, district: user.district } });

    } catch (error) {
        logger.error('Login error: ' + error.message);
        res.status(500).json({ message: 'Login failed' });
    }
});


router.get('/refresh', async (req, res) => {
    const cookies = req.cookies;
    // Return 401 (not 200) when no refresh token cookie is present
    if (!cookies?.jwt) return res.status(401).json({ accessToken: null });

    const refreshToken = cookies.jwt;

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Re-fetch user from DB to verify they are still active
        const user = await db.User.findByPk(decoded.id);
        if (!user || user.status !== 'active') {
            res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
            return res.status(403).json({ accessToken: null });
        }

        // Issue new access token with fresh user data from DB
        const accessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role, district: user.district },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        // Rotate refresh token
        const newRefreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('jwt', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ accessToken });
    } catch (err) {
        return res.status(403).json({ accessToken: null });
    }
});


router.post('/logout', (req, res) => {
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax'
    });
    res.json({ message: 'Logged out' });
});

module.exports = router;
