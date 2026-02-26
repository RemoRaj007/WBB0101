const Joi = require('joi');

const nicPattern = /^[0-9]{9}[VvXx]$|^[0-9]{12}$/;

exports.registerVolunteerSchema = {
    body: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        nic: Joi.string().pattern(nicPattern).required().messages({
            'string.pattern.base': 'NIC must be in format 123456789V or 200012345678'
        }),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(128)
            .pattern(/[A-Z]/, 'uppercase')
            .pattern(/[0-9]/, 'number')
            .required()
            .messages({
                'string.pattern.name': 'Password must contain at least one {{#name}} character'
            }),
        enumeratorId: Joi.string().max(50).required()
    })
};
