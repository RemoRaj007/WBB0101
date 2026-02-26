const express = require('express');
const router = express.Router();
const gnuidController = require('../controllers/gnuid.controller');
const verifyToken = require('../middleware/identity_vouch');

router.get('/search', verifyToken, gnuidController.searchGnuid);

module.exports = router;
