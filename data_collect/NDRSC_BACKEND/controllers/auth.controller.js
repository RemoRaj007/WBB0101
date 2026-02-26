const logger = require('../utils/logger');

exports.registerUNVolunteer = async (req, res) => {
    try {
        const { name, nic, email, password, enumeratorId } = req.body;

        if (!name || !nic || !email || !password || !enumeratorId) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const bcrypt = require('bcryptjs');
        const db = require('../models');

        const hashedPassword = await bcrypt.hash(password, 10);

        const newRequest = await db.VolunteerRequest.create({
            name,
            email,
            password: hashedPassword,
            nic,
            enumeratorId,
            status: 'pending'
        });

        // Do not return the full object (which includes the hashed password)
        res.status(201).json({ message: 'Registration successful. Please wait for approval.', id: newRequest.id });
    } catch (error) {
        logger.error('Registration Error: ' + error.message);

        if (error.name === 'SequelizeUniqueConstraintError') {
            const message = error.errors.map(e => e.message).join(', ');
            return res.status(400).json({ message });
        }

        res.status(500).json({ message: 'Registration failed' });
    }
};
