const express = require('express');
const router = express.Router();
const autofillController = require('../controllers/autofill.controller');
const verifyToken = require('../middleware/identity_vouch');

router.use(verifyToken);

router.get('/', autofillController.getByNic);

module.exports = router;
