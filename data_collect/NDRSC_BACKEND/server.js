require('dotenv').config();

// Validate required environment variables before anything else
const requiredEnv = [
    'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
    'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET', 'CLIENT_URL'
];
for (const key of requiredEnv) {
    if (!process.env[key]) {
        console.error(`FATAL: Missing required environment variable: ${key}`);
        process.exit(1);
    }
}
if (process.env.ACCESS_TOKEN_SECRET.length < 32 || process.env.REFRESH_TOKEN_SECRET.length < 32) {
    console.error('FATAL: JWT secrets must be at least 32 characters long');
    process.exit(1);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const db = require('./models');

const app = express();

// Security headers (includes HSTS in production)
app.use(helmet({
    hsts: process.env.NODE_ENV === 'production'
        ? { maxAge: 31536000, includeSubDomains: true }
        : false
}));

// CORS — CLIENT_URL is validated above so it is always set
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

// Rate limiting
const globalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please slow down.' }
});
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many login attempts. Please try again later.' }
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', loginLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(morgan('tiny', { stream: { write: message => logger.info(message.trim()) } }));

// Serve uploaded files only through an authenticated endpoint (not static)
// See routes for /api/uploads if implemented. Static serve removed for security.

// Swagger UI — only available in non-production environments
if (process.env.NODE_ENV !== 'production') {
    const swaggerUi = require('swagger-ui-express');
    const specs = require('./swagger');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
    logger.info('Swagger UI available at /api-docs (development only)');
}

app.use('/api/auth', require('./routes/auth'));
app.use('/api/abac', require('./routes/abac.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/citizens', require('./routes/citizen.routes'));
app.use('/api/relief-requests', require('./routes/relief.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/autofill', require('./routes/autofill.routes'));
app.use('/api/branches', require('./routes/branch.routes'));
app.use('/api/gnuid', require('./routes/gnuid.routes'));


app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await db.sequelize.authenticate();
        logger.info('Database connected successfully.');
        // Use sync only in development; production should use migrations
        if (process.env.NODE_ENV !== 'production') {
            await db.sequelize.sync({ alter: false });
        }
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Unable to connect to the database: ' + error.message);
        process.exit(1);
    }
};

startServer();
