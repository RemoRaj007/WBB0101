const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const verifyToken = require('../middleware/identity_vouch');

const authorizeReportAccess = (req, res, next) => {
    const allowedRoles = ['Super User', 'National Officer', 'UN Volunteer', 'District Officer', 'Division Officer'];
    if (allowedRoles.includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ message: "Forbidden: You do not have permission to access reports." });
    }
};

router.use(verifyToken);
router.use(authorizeReportAccess);

router.get('/relief/excel', reportController.generateReliefExcel);
router.get('/relief/pdf', reportController.generateReliefPdf);

module.exports = router;
