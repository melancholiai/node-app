const Joi = require('@hapi/joi');
const { uniqueArrayOfObjectIds } = require('./utils');

const socialCircleSchema = Joi.object({
    title: Joi.string()
      .min(1)
      .max(30)
      .required()
      .label('Title'),
    userIds: uniqueArrayOfObjectIds('User Id', 1, 1000)
});

exports.socialCircleSchema = socialCircleSchema;
