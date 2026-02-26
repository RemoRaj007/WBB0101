const db = require('../models');
const ReliefRequest = db.ReliefRequest;
const ReliefRequestMedia = db.ReliefRequestMedia;
const logger = require('../utils/logger');

exports.createRequest = async (req, res) => {
    try {
        const {
            gnId, gnDivision, dsDivision, district, householdId, censusBlock, censusUnit,
            incidentType, startDate, endDate, ownershipStatus, isEstate,
            damageZone, damageSeverity, reliefAmount,
            bankName, branchName, accountHolder, accountNumber, accountNic
        } = req.body;

        
        const existingNic = await ReliefRequest.findOne({
            where: { accountNic, status: ['pending', 'approved'] }
        });

        let isDuplicate = false;
        let duplicateReason = null;

        if (existingNic) {
            
            if (req.user.role === 'GN Officer' || req.user.role === 'UN Volunteer') {
                isDuplicate = true;
                duplicateReason = "Duplicate NIC found: " + accountNic;
            } else {
                return res.status(400).json({ message: "This NIC has already been used for a relief request." });
            }
        }

        
        let existingRequest = null;
        if (!isDuplicate) {
            existingRequest = await ReliefRequest.findOne({
                where: {
                    householdId,
                    incidentType,
                    status: ['pending', 'approved']
                }
            });
            if (existingRequest) {
                if (req.user.role === 'GN Officer' || req.user.role === 'UN Volunteer') {
                    isDuplicate = true;
                    duplicateReason = "Duplicate Request: Household " + householdId + " already has a request for " + incidentType;
                } else {
                    return res.status(400).json({ message: "A request for this household and incident type already exists." });
                }
            }
        }

        const newRequest = await ReliefRequest.create({
            gnId, gnDivision, dsDivision, district, householdId, censusBlock, censusUnit,
            incidentType, startDate, endDate, ownershipStatus,
            isEstate: isEstate === 'true', // Convert string to boolean if coming from FormData
            damageZone, damageSeverity, reliefAmount,
            bankName, branchName, accountHolder, accountNumber, accountNic,
            dataEnteredBy: req.user.id,
            status: 'pending',
            isDuplicate,
            duplicateReason,
            originalRequestId: isDuplicate && existingNic ? existingNic.id : (isDuplicate && existingRequest ? existingRequest.id : null)
        });

        // Handle File Uploads
        if (req.files && req.files.length > 0) {
            const mediaEntries = req.files.map(file => ({
                reliefRequestId: newRequest.id,
                fileUrl: file.path.replace(/\\/g, '/'), // Store relative path, normalize slashes
                fileType: 'image',
                originalName: file.originalname
            }));
            await ReliefRequestMedia.bulkCreate(mediaEntries);
        }

        res.status(201).json(newRequest);
    } catch (error) {
        logger.error("Error creating relief request: " + error.message);
        res.status(500).json({ message: "Failed to submit relief request." });
    }
};

exports.getRequests = async (req, res) => {
    try {
        const { status } = req.query;
        let where = {};

        if (status) {
            where.status = status;
        }

        
        if (req.user.role === 'Super User' || req.user.role === 'National Officer') {
            
        } else if (req.user.role === 'District Officer') {
            where.district = req.user.district;
        } else if (req.user.role === 'Division Officer') {
            where.dsDivision = req.user.dsDivision; 
        } else if (req.user.role === 'UN Volunteer') {
            where[db.Sequelize.Op.or] = [
                { dataEnteredBy: req.user.id },
                { assignedVolunteerId: req.user.id }
            ];
            // If status is present, ensure it applies to the filtered set
            if (status) {
                where.status = status;
            }
        } else {
            // Default for Ground Officers (GN, Volunteer, etc.) - See what they entered
            where.dataEnteredBy = req.user.id;
        }

        const requests = await ReliefRequest.findAll({
            where,
            include: [
                { model: db.User, as: 'enumerator', attributes: ['username', 'id'] },
                { model: db.User, as: 'actioner', attributes: ['username', 'id'] },
                { model: db.User, as: 'assignedVolunteer', attributes: ['username', 'id', 'phoneNumber'] },
                { model: db.ReliefRequestMedia, as: 'media' } // Include Media
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(requests);
    } catch (error) {
        logger.error("Error fetching relief requests: " + error.message);
        res.status(500).json({ message: "Failed to fetch requests." });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body; // status: 'approved' | 'rejected'

        const request = await ReliefRequest.findByPk(id);
        if (!request) {
            return res.status(404).json({ message: "Request not found." });
        }

        const allowedRoles = ['Division Officer', 'Super User', 'District Officer', 'National Officer'];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "You are not authorized to approve requests." });
        }

        // Geo-boundary enforcement: District Officers can only act on their own district
        if (req.user.role === 'District Officer' && request.district !== req.user.district) {
            return res.status(403).json({ message: "You can only action requests in your assigned district." });
        }

        // Division Officers can only act on their own DS division
        if (req.user.role === 'Division Officer' && request.dsDivision !== req.user.dsDivision) {
            return res.status(403).json({ message: "You can only action requests in your assigned division." });
        }

        request.status = status;
        request.remarks = remarks;
        request.actionBy = req.user.id;
        await request.save();

        res.json({ message: `Request ${status} successfully.`, request });
    } catch (error) {
        logger.error("Error updating relief request status: " + error.message);
        res.status(500).json({ message: "Failed to update status." });
    }
};

exports.assignVolunteer = async (req, res) => {
    try {
        const { id } = req.params;
        const { volunteerId } = req.body;

        if (req.user.role !== 'National Officer' && req.user.role !== 'Super User') {
            return res.status(403).json({ message: "You are not authorized to assign volunteers." });
        }

        const request = await ReliefRequest.findByPk(id);
        if (!request) {
            return res.status(404).json({ message: "Request not found." });
        }

        request.assignedVolunteerId = volunteerId;
        await request.save();

        const updatedRequest = await ReliefRequest.findByPk(id, {
            include: [{ model: db.User, as: 'assignedVolunteer', attributes: ['username', 'id'] }]
        });

        res.json({ message: "Volunteer assigned successfully.", request: updatedRequest });
    } catch (error) {
        logger.error("Error assigning volunteer: " + error.message);
        res.status(500).json({ message: "Failed to assign volunteer." });
    }
};

exports.getDistrictStats = async (req, res) => {
    try {
        const stats = await ReliefRequest.findAll({
            attributes: [
                'district',
                'status',
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
            ],
            group: ['district', 'status'],
            raw: true
        });

        // Transform data for frontend: { "Colombo": { pending: 5, approved: 2, rejected: 1 }, ... }
        const formattedStats = {};
        stats.forEach(item => {
            const { district, status, count } = item;
            if (!district) return; // Skip if district is null

            if (!formattedStats[district]) {
                formattedStats[district] = { pending: 0, approved: 0, rejected: 0, total: 0 };
            }
            formattedStats[district][status] = parseInt(count, 10);
            formattedStats[district].total += parseInt(count, 10);
        });

        res.json(formattedStats);
    } catch (error) {
        logger.error("Error fetching district stats: " + error.message);
        res.status(500).json({ message: "Failed to fetch district statistics." });
    }
};

exports.getRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await ReliefRequest.findByPk(id, {
            include: [
                { model: db.User, as: 'enumerator', attributes: ['username', 'id'] },
                { model: db.User, as: 'actioner', attributes: ['username', 'id'] },
                { model: db.User, as: 'assignedVolunteer', attributes: ['username', 'id', 'phoneNumber'] },
                { model: db.ReliefRequestMedia, as: 'media' }
            ]
        });

        if (!request) {
            return res.status(404).json({ message: "Request not found." });
        }

        res.json(request);
    } catch (error) {
        logger.error("Error fetching request by ID: " + error.message);
        res.status(500).json({ message: "Failed to fetch request." });
    }
};
