const express = require('express');
const router = express.Router();
const citizenController = require('../controllers/citizen.controller');
const verifyToken = require('../middleware/identity_vouch');
const checkAbac = require('../middleware/abac.middleware');
const upload = require('../middleware/upload.middleware');


router.use(verifyToken);


router.post('/', checkAbac('page:citizen_data', 'create'), upload.single('scannedFormImage'), citizenController.createCitizen);

router.get('/', checkAbac('page:citizen_data', 'read'), citizenController.getCitizens);

router.put('/:id/status', checkAbac('page:citizen_data', 'update'), citizenController.updateStatus);

module.exports = router;
