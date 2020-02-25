const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const objectIdSchema = Joi.object({
  id: Joi.objectId().label('Object ID')
});

const booleanSchema = Joi.object({
  bool: Joi.boolean().label('Boolean')
});

const uniqueArrayOfObjectIds = (name, min, max) =>
  Joi.array()
    .required()
    .unique()
    .min(min)
    .max(max)
    .items(Joi.objectId().label(name))
    .label(name + 's');

exports.objectIdSchema = objectIdSchema;
exports.booleanSchema = booleanSchema;
exports.uniqueArrayOfObjectIds = uniqueArrayOfObjectIds;
