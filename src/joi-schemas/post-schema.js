const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const createdById = Joi.objectId()
.required()
.label('User Id');

const imageUrl = Joi.string()
    .required()
    .label('Image');

const description = Joi.string()
    .max(150)
    .label('Description');

const isPublic = Joi.bool()
    .required()
    .label('isPublic');


exports.newPostSchema = Joi.object({
    createdById,
    imageUrl,
    isPublic
});