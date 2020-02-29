const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const objectIdSchema = Joi.objectId().label('Object ID');

const booleanSchema = Joi.boolean().label('Boolean')

const uniqueArrayOfObjectIds = (name, min, max) =>
  Joi.array()
    .required()
    .unique()
    .min(min)
    .max(max)
    .items(Joi.objectId().label(name))
    .label(name + 's');

  const latitude = Joi.number()
  .min(-90)
  .max(90)
  .required()
  .label('Latitude');

const longtitude = Joi.number()
  .min(-180)
  .max(180)
  .required()
  .label('Longtitude');

exports.objectIdSchema = objectIdSchema;
exports.booleanSchema = booleanSchema;
exports.uniqueArrayOfObjectIds = uniqueArrayOfObjectIds;
exports.coordinatesSchema = Joi.object({
      latitude,
      longtitude
    });
