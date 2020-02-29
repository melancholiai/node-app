const Joi = require('@hapi/joi');
const { booleanSchema, objectIdSchema } = require('./utils');

const socialCircleSchema = Joi.object({
    friendRequestId: objectIdSchema,
    hasAccepted: booleanSchema
});

exports.socialCircleSchema = socialCircleSchema;
