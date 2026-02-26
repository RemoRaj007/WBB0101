const express = require('express');
const router = express.Router();
const reliefController = require('../controllers/relief.controller');
const verifyToken = require('../middleware/identity_vouch');
const checkAbac = require('../middleware/abac.middleware');
const validate = require('../middleware/validate');
const { createReliefSchema, updateStatusSchema } = require('../validators/relief.validator');

router.use(verifyToken);

const upload = require('../middleware/upload.evidence.middleware');


router.post('/', checkAbac('page:relief_request', 'create'), upload.array('evidence', 5), validate(createReliefSchema), reliefController.createRequest);


router.get('/stats/district', checkAbac('page:relief_request', 'read'), reliefController.getDistrictStats);
router.get('/:id', checkAbac('page:relief_request', 'read'), reliefController.getRequestById);
router.get('/', checkAbac('page:relief_request', 'read'), reliefController.getRequests);

router.put('/:id/status', checkAbac('page:relief_request', 'update'), validate(updateStatusSchema), reliefController.updateStatus);
router.put('/:id/assign', checkAbac('page:relief_request', 'update'), reliefController.assignVolunteer);

module.exports = router;
