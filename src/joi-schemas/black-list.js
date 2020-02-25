const Joi = require('@hapi/joi');
const { uniqueArrayOfObjectIds } = require('./utils');

const editBlackListSchema = Joi.object({
  userIds: uniqueArrayOfObjectIds('User Id', 1, 1000)
});

module.exports.editBlackListSchema = editBlackListSchema;
