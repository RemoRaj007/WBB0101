const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branch.controller');
const verifyToken = require('../middleware/identity_vouch');

router.get('/', verifyToken, branchController.getAllBranches);

module.exports = router;
