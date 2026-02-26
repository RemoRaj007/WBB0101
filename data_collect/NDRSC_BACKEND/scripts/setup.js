require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');

const setup = async () => {
    try {
        // Step 1: Create Database if not exists
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        await connection.end();
        console.log(`Database ${process.env.DB_NAME} created or already exists.`);

        // Step 2: Initialize Sequelize with the created DB
        const db = require('../models'); // Now it should connect fine

        await db.sequelize.authenticate();
        console.log('Database connected...');

        await db.sequelize.sync({ alter: true });
        console.log('Models synced...');

        // Seed Roles
        const roles = ['Super User', 'National Officer', 'District Officer', 'Division Officer', 'GN Officer', 'UN Volunteer'];
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

        // Seed Super User
        const superUserRole = await db.Role.findOne({ where: { name: 'Super User' } });
        await db.User.findOrCreate({
            where: { username: 'superuser' },
            defaults: {
                username: 'superuser',
                email: 'super@drs.local',
                password: passwordHash,
                role: 'Super User',
                roleId: superUserRole.id,
                district: 'National',
                status: 'active'
            }
        });
        console.log('Super User seeded...');

        // Seed National Officer
        const nationalRole = await db.Role.findOne({ where: { name: 'National Officer' } });
        await db.User.findOrCreate({
            where: { username: 'national_officer' },
            defaults: {
                username: 'national_officer',
                email: 'national@drs.local',
                password: passwordHash,
                role: 'National Officer',
                roleId: nationalRole.id,
                district: 'National',
                status: 'active',
                nic: '111111111V'
            }
        });

        // Seed District Officer
        const districtRole = await db.Role.findOne({ where: { name: 'District Officer' } });
        await db.User.findOrCreate({
            where: { username: 'district_officer' },
            defaults: {
                username: 'district_officer',
                email: 'district@drs.local',
                password: passwordHash,
                role: 'District Officer',
                roleId: districtRole.id,
                district: 'Colombo',
                status: 'active',
                nic: '222222222V'
            }
        });

        // Seed Division Officer
        const divisionRole = await db.Role.findOne({ where: { name: 'Division Officer' } });
        await db.User.findOrCreate({
            where: { username: 'division_officer' },
            defaults: {
                username: 'division_officer',
                email: 'division@drs.local',
                password: passwordHash,
                role: 'Division Officer',
                roleId: divisionRole.id,
                district: 'Colombo',
                dsDivision: 'Colombo',
                status: 'active',
                nic: '333333333V'
            }
        });

        // Seed GN Officer
        const gnRole = await db.Role.findOne({ where: { name: 'GN Officer' } });
        await db.User.findOrCreate({
            where: { username: 'gn_officer' },
            defaults: {
                username: 'gn_officer',
                email: 'gn@drs.local',
                password: passwordHash,
                role: 'GN Officer',
                roleId: gnRole.id,
                district: 'Colombo',
                dsDivision: 'Colombo',
                gnDivision: 'Cinnamon Gardens',
                status: 'active',
                nic: '444444444V'
            }
        });

        // Seed UN Volunteer (Active)
        const unvRole = await db.Role.findOne({ where: { name: 'UN Volunteer' } });
        await db.User.findOrCreate({
            where: { username: 'un_volunteer' },
            defaults: {
                username: 'un_volunteer',
                email: 'volunteer@drs.local',
                password: passwordHash,
                role: 'UN Volunteer',
                roleId: unvRole.id,
                district: 'Colombo',
                status: 'active',
                nic: '555555555V',
                enumeratorId: 'UNV001'
            }
        });

        // Seed UN Volunteer (Inactive/Pending)
        await db.User.findOrCreate({
            where: { username: 'un_pending' },
            defaults: {
                username: 'un_pending',
                email: 'pending@drs.local',
                password: passwordHash,
                role: 'UN Volunteer',
                roleId: unvRole.id,
                district: 'Colombo',
                status: 'inactive',
                nic: '666666666V',
                enumeratorId: 'UNV002'
            }
        });
        console.log('Hierarchy users seeded...');

        // Seed Default ABAC Policies
        const policies = [
            // National Officer can view all users
            {
                name: 'National Officer User View',
                resource: 'page:user_management',
                action: 'read',
                subject: { role: 'National Officer' },
                effect: 'ALLOW',
                priority: 10
            },
            // National Officer can view pending approvals (implicit in user management or specific resource)
            // For now, let's allow them to 'read' user management page which serves strictly as the gatekeeper for the route
        ];

        for (const policy of policies) {
            await db.ABACPolicy.findOrCreate({
                where: { name: policy.name },
                defaults: policy
            });
        }
        console.log('ABAC policies seeded...');

        console.log('Setup complete!');
        process.exit(0);
    } catch (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }
};

setup();
