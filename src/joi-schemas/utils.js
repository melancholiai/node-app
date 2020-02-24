const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const objectIdSchema = Joi.object({
  id: Joi.objectId().label('Object ID')
});

const booleanSchema = Joi.object({
  bool: Joi.boolean()
    .label('Boolean')
});

exports.objectIdSchema = objectIdSchema;
exports.booleanSchema = booleanSchema;
