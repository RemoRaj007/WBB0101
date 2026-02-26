const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const checkAbac = require('../middleware/abac.middleware');
const verifyToken = require('../middleware/identity_vouch');
const upload = require('../middleware/upload.middleware');
const validate = require('../middleware/validate');
const { createUserSchema, updateUserSchema } = require('../validators/user.validator');


router.get('/me', verifyToken, userController.getMe);
router.put('/me', verifyToken, upload.single('avatar'), userController.updateMe);


router.get('/', verifyToken, checkAbac('page:user_management', 'read'), userController.getAllUsers);
router.post('/', verifyToken, checkAbac('page:user_management', 'create'), validate(createUserSchema), userController.createUser);
router.put('/:id', verifyToken, checkAbac('page:user_management', 'update'), validate(updateUserSchema), userController.updateUser);
router.delete('/:id', verifyToken, checkAbac('page:user_management', 'delete'), userController.deleteUser);


router.get('/volunteers/pending', verifyToken, checkAbac('page:user_management', 'read'), userController.getPendingVolunteers);
router.put('/volunteers/:id/approve', verifyToken, checkAbac('page:user_management', 'update'), userController.approveVolunteer);
router.get('/volunteers/active', verifyToken, checkAbac('page:user_management', 'read'), userController.getActiveVolunteers);

module.exports = router;
