require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../models');

const seed = async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Database connected for seeding...');

        // Sync models to ensure tables exist
        await db.sequelize.sync({ alter: true });

        // 1. Seed Roles
        const roles = [
            'Super User',
            
            'UN Volunteer'
        ];

        for (const roleName of roles) {
            await db.Role.findOrCreate({
                where: { name: roleName },
                defaults: {
                    name: roleName,
                    status: 'active'
                }
            });
        }
        console.log('Roles seeded...');

        const passwordHash = await bcrypt.hash('password123', 10);

        // 2. Seed Users (One for each role)
        // Referencing User Model Fields: username, email, password, role, roleId, district, nic, enumeratorId, gnDivision, dsDivision, status

        const usersToSeed = [
            {
                role: 'Super User',
                username: 'superuser',
                email: 'super@drs.local',
                district: 'National', // Super User is National
                nic: '000000000V'
            },
            {
                role: 'National Officer',
                username: 'national_officer',
                email: 'national@drs.local',
                district: 'National',
                nic: '111111111V'
            },
            {
                role: 'District Officer',
                username: 'district_officer',
                email: 'district@drs.local',
                district: 'Colombo', // assigned to Colombo District
                nic: '222222222V'
            },
            {
                role: 'Division Officer',
                username: 'division_officer',
                email: 'division@drs.local',
                district: 'Colombo',
                dsDivision: 'Colombo', // assigned to Colombo DS Division
                nic: '333333333V'
            },
            {
                role: 'GN Officer',
                username: 'gn_officer',
                email: 'gn@drs.local',
                district: 'Colombo',
                dsDivision: 'Colombo',
                gnDivision: 'Cinnamon Gardens', // assigned to specific GN
                nic: '444444444V'
            },
            {
                role: 'UN Volunteer',
                username: 'un_volunteer',
                email: 'volunteer@drs.local',
                district: 'Colombo',
                enumeratorId: 'UNV001',
                nic: '555555555V'
            }
        ];

        for (const u of usersToSeed) {
            const role = await db.Role.findOne({ where: { name: u.role } });

            if (role) {
                const [user, created] = await db.User.findOrCreate({
                    where: { username: u.username },
                    defaults: {
                        username: u.username,
                        email: u.email,
                        password: passwordHash,
                        role: u.role,
                        roleId: role.id,
                        district: u.district,
                        dsDivision: u.dsDivision || null,
                        gnDivision: u.gnDivision || null,
                        enumeratorId: u.enumeratorId || null,
                        nic: u.nic,
                        status: 'active'
                    }
                });

                if (created) {
                    console.log(`Created user: ${u.username} (${u.role})`);
                } else {
                    console.log(`User already exists: ${u.username}`);
                }
            } else {
                console.error(`Role not found: ${u.role}`);
            }
        }
        console.log('Users seeded...');

        // 3. Seed Default ABAC Policies (If model exists)
        if (db.ABACPolicy) {
            const policies = [
                {
                    name: 'National Officer User View',
                    resource: 'page:user_management',
                    action: 'read',
                    subject: { role: 'National Officer' },
                    effect: 'ALLOW',
                    priority: 10
                },
                {
                    name: 'National Officer Approve Relief',
                    resource: 'page:relief_request',
                    action: 'approve', // Just in case we use strict action checks later
                    subject: { role: 'National Officer' },
                    effect: 'ALLOW',
                    priority: 10
                },
                {
                    name: 'National Officer User Update',
                    resource: 'page:user_management',
                    action: 'update',
                    subject: { role: 'National Officer' },
                    effect: 'ALLOW',
                    priority: 10
                },
                {
                    name: 'National Officer User Create',
                    resource: 'page:user_management',
                    action: 'create',
                    subject: { role: 'National Officer' },
                    effect: 'ALLOW',
                    priority: 10
                },
                {
                    name: 'National Officer User Delete',
                    resource: 'page:user_management',
                    action: 'delete',
                    subject: { role: 'National Officer' },
                    effect: 'ALLOW',
                    priority: 10
                }
            ];

            for (const policy of policies) {
                await db.ABACPolicy.findOrCreate({
                    where: { name: policy.name },
                    defaults: policy
                });
            }
            console.log('ABAC policies seeded...');
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
