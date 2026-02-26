const { User, Role } = require('../models');
const bcrypt = require('bcryptjs');

class UserService {
    async getAllUsers() {
        return await User.findAll({
            where: { status: 'active' },
            include: [{ model: Role, attributes: ['name'] }],
            attributes: { exclude: ['password'] }
        });
    }

    async createUser(userData) {
        const { username, email, password, role, district, nic, enumeratorId, gnDivision, dsDivision, status } = userData;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let roleId;
        const roleRecord = await Role.findOne({ where: { name: role } });
        if (roleRecord) {
            roleId = roleRecord.id;
        } else {
            throw new Error('Invalid Role');
        }

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role,
            roleId: roleId,
            district: district,
            nic,
            enumeratorId,
            gnDivision,
            dsDivision,
            status: status || 'active'
        });

        return { id: newUser.id, username, email, role };
    }

    async getMe(id) {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });
        if (!user || user.status !== 'active') {
            throw new Error('User not found');
        }
        return user;
    }

    async updateMe(id, updateData) {
        // Restricted update for self: only certain fields + no role change
        const { username, email, avatar, phoneNumber, bio } = updateData;

        const user = await User.findByPk(id);
        if (!user || user.status !== 'active') {
            throw new Error('User not found');
        }

        await user.update({
            username,
            email,
            avatar,
            phoneNumber,
            bio
        });

        return user;
    }

    async updateUser(id, updateData) {
        const { username, email, role, district, avatar, phoneNumber, bio, status, nic, enumeratorId, gnDivision, dsDivision } = updateData;

        const user = await User.findByPk(id);
        if (!user) {
            throw new Error('User not found');
        }

        let roleId = user.roleId;
        if (role) {
            const roleRecord = await Role.findOne({ where: { name: role } });
            if (roleRecord) {
                roleId = roleRecord.id;
            }
        }

        await user.update({
            username,
            email,
            role,
            roleId,
            district,
            avatar,
            phoneNumber,
            bio,
            status,
            nic,
            enumeratorId,
            gnDivision,
            dsDivision
        });

        return user;
    }

    async deleteUser(id) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new Error('User not found');
        }

        await user.update({ status: 'inactive' });
        return true;
    }

    // Used when approving volunteers — password is already hashed, skip re-hashing
    async createUserWithHashedPassword(userData) {
        const { username, email, hashedPassword, role, district, nic, enumeratorId, gnDivision, dsDivision, status } = userData;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('User already exists');
        }

        const roleRecord = await Role.findOne({ where: { name: role } });
        if (!roleRecord) {
            throw new Error('Invalid Role');
        }

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role,
            roleId: roleRecord.id,
            district,
            nic,
            enumeratorId,
            gnDivision,
            dsDivision,
            status: status || 'active'
        });

        return newUser;
    }
}

module.exports = new UserService();
