const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const distance = Joi.number()
    .min(0)
    .max(100)
    .required()
    .label('Description');

exports.filterSchema = Joi.object({
    distance
});