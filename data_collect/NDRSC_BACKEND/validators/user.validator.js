const Joi = require('joi');

const ALLOWED_ROLES = ['National Officer', 'District Officer', 'Division Officer', 'GN Officer', 'UN Volunteer'];

exports.createUserSchema = {
    body: Joi.object({
        username: Joi.string().alphanum().min(3).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(128).required(),
        role: Joi.string().valid(...ALLOWED_ROLES).required(),
        district: Joi.string().max(100).optional(),
        nic: Joi.string().max(20).optional(),
        gnDivision: Joi.string().max(100).optional(),
        dsDivision: Joi.string().max(100).optional(),
        enumeratorId: Joi.string().max(50).optional()
    })
};

exports.updateUserSchema = {
    body: Joi.object({
        username: Joi.string().alphanum().min(3).max(50).optional(),
        email: Joi.string().email().optional(),
        role: Joi.string().valid(...ALLOWED_ROLES).optional(),
        district: Joi.string().max(100).optional(),
        status: Joi.string().valid('active', 'inactive', 'pending').optional(),
        nic: Joi.string().max(20).optional(),
        gnDivision: Joi.string().max(100).optional(),
        dsDivision: Joi.string().max(100).optional(),
        enumeratorId: Joi.string().max(50).optional(),
        phoneNumber: Joi.string().max(20).optional(),
        bio: Joi.string().max(500).optional(),
        avatar: Joi.string().max(500).optional()
    })
};
