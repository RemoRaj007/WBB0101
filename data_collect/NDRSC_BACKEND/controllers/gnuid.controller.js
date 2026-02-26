const logger = require('../utils/logger');
const db = require('../models');
const GNUID = db.GNUID;
const { Op } = require('sequelize');

exports.searchGnuid = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.length < 2) {
            return res.json([]);
        }

        const results = await GNUID.findAll({
            where: {
                [Op.or]: [
                    { gnUid: { [Op.like]: `${query}%` } },
                    { gnNumber: { [Op.like]: `${query}%` } },
                    { gnDivision: { [Op.like]: `%${query}%` } },
                    { dsDivision: { [Op.like]: `%${query}%` } }
                ]
            },
            limit: 10
        });

        res.json(results);
    } catch (error) {
        logger.error("Error searching GNUID: " + error.message);
        res.status(500).json({ message: "Failed to search GNUID." });
    }
};
