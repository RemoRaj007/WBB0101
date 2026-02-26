const db = require('../models');
const logger = require('../utils/logger');

exports.getAllBranches = async (req, res) => {
  try {
    const branches = await db.Branch.findAll();
    res.json(branches);
  } catch (error) {
    logger.error('Error fetching branches: ' + error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
