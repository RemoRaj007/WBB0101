const userService = require('../services/user.service');
const logger = require('../utils/logger');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        logger.error('Error fetching users: ' + error.message);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// Create a new user (Admin only) — fields are whitelisted to prevent mass assignment
exports.createUser = async (req, res) => {
    try {
        // Explicitly whitelist fields; never accept role/status escalation from body blindly
        const { username, email, password, role, district, nic, gnDivision, dsDivision, enumeratorId } = req.body;

        // Only allow specific roles to be assigned
        const allowedRoles = ['National Officer', 'District Officer', 'Division Officer', 'GN Officer', 'UN Volunteer'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid or unauthorized role assignment' });
        }

        const newUser = await userService.createUser({ username, email, password, role, district, nic, gnDivision, dsDivision, enumeratorId, status: 'active' });
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        logger.error('Error creating user: ' + error.message);
        if (error.message === 'User already exists' || error.message === 'Invalid Role') {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Error creating user' });
        }
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        await userService.updateUser(req.params.id, req.body);
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        logger.error('Error updating user: ' + error.message);
        if (error.message === 'User not found') {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Error updating user' });
        }
    }
};

// Get current user profile
exports.getMe = async (req, res) => {
    try {
        const user = await userService.getMe(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        logger.error('Error fetching profile: ' + error.message);
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

// Update current user profile
exports.updateMe = async (req, res) => {
    try {
        const updateData = { ...req.body };

        if (req.file) {
            updateData.avatar = `/uploads/avatars/${req.file.filename}`;
        }

        const user = await userService.updateMe(req.user.id, updateData);
        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        logger.error('Error updating profile: ' + error.message);
        res.status(500).json({ message: 'Error updating profile' });
    }
};


exports.getPendingVolunteers = async (req, res) => {
    try {
        const db = require('../models');
        // Exclude password hash from the response
        const volunteers = await db.VolunteerRequest.findAll({
            where: { status: 'pending' },
            attributes: { exclude: ['password'] }
        });
        res.status(200).json(volunteers);
    } catch (error) {
        logger.error('Error fetching pending volunteers: ' + error.message);
        res.status(500).json({ message: 'Error fetching pending volunteers' });
    }
};

exports.approveVolunteer = async (req, res) => {
    try {
        const db = require('../models');
        const { id } = req.params;
        const { status, district } = req.body;
        const normalizedStatus = typeof status === 'string' ? status.trim().toLowerCase() : '';
        const normalizedDistrict = typeof district === 'string' ? district.trim() : '';

        const vRequest = await db.VolunteerRequest.findByPk(id);
        if (!vRequest) {
            return res.status(404).json({ message: 'Volunteer request not found' });
        }

        if (normalizedStatus !== 'active' && normalizedStatus !== 'rejected') {
            return res.status(400).json({ message: 'Invalid status. Use active or rejected.' });
        }

        if (normalizedStatus === 'active') {
            if (!normalizedDistrict) {
                return res.status(400).json({ message: 'District is required for approval.' });
            }

            // Create user using the already-hashed password from the volunteer request
            // Pass preHashedPassword to skip re-hashing in userService
            const userService = require('../services/user.service');
            const newUser = await userService.createUserWithHashedPassword({
                username: vRequest.name.replace(/\s+/g, '_').toLowerCase(),
                email: vRequest.email,
                hashedPassword: vRequest.password,
                role: 'UN Volunteer',
                district: normalizedDistrict,
                nic: vRequest.nic,
                enumeratorId: vRequest.enumeratorId,
                status: 'active'
            });

            await vRequest.destroy();
            logger.info(`Volunteer approved: ${vRequest.email} by user ${req.user.id}`);
            return res.status(200).json({
                message: 'Volunteer approved and user created successfully',
                user: { id: newUser.id, email: newUser.email, district: newUser.district, role: newUser.role, status: newUser.status }
            });
        } else {
            vRequest.status = 'rejected';
            await vRequest.save();
            return res.status(200).json({ message: 'Volunteer request rejected' });
        }
    } catch (error) {
        logger.error('Error approving volunteer: ' + error.message);
        res.status(500).json({ message: 'Error processing volunteer approval' });
    }
};

// Delete user (soft delete)
exports.deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting user: ' + error.message);
        if (error.message === 'User not found') {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Error deleting user' });
        }
    }
};


exports.getActiveVolunteers = async (req, res) => {
    try {
        const db = require('../models');
        const volunteers = await db.User.findAll({
            where: {
                role: 'UN Volunteer',
                status: 'active'
            },
            attributes: ['id', 'username', 'email', 'phoneNumber', 'district']
        });
        res.status(200).json(volunteers);
    } catch (error) {
        logger.error('Error fetching active volunteers: ' + error.message);
        res.status(500).json({ message: 'Error fetching active volunteers' });
    }
};
