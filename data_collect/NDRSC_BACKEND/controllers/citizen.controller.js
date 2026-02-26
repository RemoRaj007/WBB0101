const logger = require('../utils/logger');
const db = require('../models');

exports.createCitizen = async (req, res) => {
    try {
        const { name, nic, address, phone, gnDivision, dsDivision, district } = req.body;

       
        const existing = await db.Citizen.findOne({ where: { nic } });
        if (existing) {
            return res.status(400).json({ message: 'Citizen with this NIC already exists' });
        }

        let scannedFormImage = null;
        if (req.file) {
            scannedFormImage = `/uploads/citizens/${req.file.filename}`;
        }

        const newCitizen = await db.Citizen.create({
            name,
            nic,
            address,
            phone,
            gnDivision,
            dsDivision,
            district,
            scannedFormImage,
            dataEnteredBy: req.user.id,
            status: 'pending'
        });

        res.status(201).json({ message: 'Citizen data submitted successfully', citizen: newCitizen });
    } catch (error) {
        logger.error('Create Citizen Error: ' + error.message);
        res.status(500).json({ message: 'Failed to submit citizen data' });
    }
};

exports.getCitizens = async (req, res) => {
    try {
        const { role, id } = req.user;
        let where = {};

        if (role === 'GN Officer' || role === 'UN Volunteer') {
            where = { dataEnteredBy: id };
        } else if (role === 'National Officer' || role === 'Super User') {
           
            if (req.query.status) {
                where.status = req.query.status;
            }
        } else {
            
        }

        const citizens = await db.Citizen.findAll({
            where,
            include: [{ model: db.User, as: 'enumerator', attributes: ['username', 'email'] }]
        });

        res.status(200).json(citizens);
    } catch (error) {
        logger.error('Get Citizens Error: ' + error.message);
        res.status(500).json({ message: 'Failed to fetch citizens' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const citizen = await db.Citizen.findByPk(id);
        if (!citizen) {
            return res.status(404).json({ message: 'Citizen not found' });
        }

        citizen.status = status;
        await citizen.save();

        res.status(200).json({ message: `Citizen data ${status}`, citizen });
    } catch (error) {
        logger.error('Update Status Error: ' + error.message);
        res.status(500).json({ message: 'Failed to update status' });
    }
};
