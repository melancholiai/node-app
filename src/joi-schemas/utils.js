const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const objectIdSchema = Joi.object({    
    id: Joi.objectId()
      .label('Object ID')
  });

exports.objectIdSchema = objectIdSchema;
