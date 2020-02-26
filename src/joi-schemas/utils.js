const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const objectIdSchema = Joi.object({    
    id: Joi.objectId()
      .label('Object ID')
  });

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
exports.coordinatesSchema = Joi.object({
  latitude,
  longtitude
});
