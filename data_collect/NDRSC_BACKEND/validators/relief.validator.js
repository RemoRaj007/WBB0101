const Joi = require('joi');

exports.createReliefSchema = {
    body: Joi.object({
        gnId: Joi.string().max(50).optional(),
        gnDivision: Joi.string().max(100).required(),
        dsDivision: Joi.string().max(100).required(),
        district: Joi.string().max(100).required(),
        householdId: Joi.string().max(50).required(),
        censusBlock: Joi.string().max(50).optional(),
        censusUnit: Joi.string().max(50).optional(),
        incidentType: Joi.string().max(100).required(),
        startDate: Joi.date().iso().required(),
        endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
        ownershipStatus: Joi.string().max(50).optional(),
        isEstate: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')).optional(),
        damageZone: Joi.string().max(100).optional(),
        damageSeverity: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
        reliefAmount: Joi.number().min(0).max(10000000).optional(),
        bankName: Joi.string().max(100).optional(),
        branchName: Joi.string().max(100).optional(),
        accountHolder: Joi.string().max(100).optional(),
        accountNumber: Joi.string().max(30).optional(),
        accountNic: Joi.string().max(20).optional()
    })
};

exports.updateStatusSchema = {
    body: Joi.object({
        status: Joi.string().valid('approved', 'rejected').required(),
        remarks: Joi.string().max(500).optional()
    })
};
