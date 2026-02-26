const express = require('express');
const router = express.Router();
const abacController = require('../controllers/abac.controller');
const checkAbac = require('../middleware/abac.middleware');
const verifyToken = require('../middleware/identity_vouch');

// All ABAC policy management routes require authentication first, then ABAC authorization
router.post('/', verifyToken, checkAbac('system:policies', 'create'), abacController.createPolicy);
router.get('/', verifyToken, checkAbac('system:policies', 'read'), abacController.getAllPolicies);
router.put('/:id', verifyToken, checkAbac('system:policies', 'update'), abacController.updatePolicy);
router.delete('/:id', verifyToken, checkAbac('system:policies', 'delete'), abacController.deletePolicy);

module.exports = router;
