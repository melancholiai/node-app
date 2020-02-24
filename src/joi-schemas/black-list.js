const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

/* the userIds must be an array of between 1 to 1000 unique valid userIds
 each userId mustn't be the actual userId who passes the schema*/
const editBlackListSchema = Joi.object({
  userIds: Joi.array()
    .required()
    .min(1)
    .max(1000)
    .unique()
    .items(Joi.objectId().label('User Id'))
    .label('User Ids')
});

module.exports.editBlackListSchema = editBlackListSchema;
