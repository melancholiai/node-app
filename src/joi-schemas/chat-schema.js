const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

// the userIds must be an array of between 1 to 100 unique valid userIds each userId mustn't be the actual userId who passes the schema
const startChatSchema =
  Joi.object({
    title: Joi.string()
      .min(1)
      .max(30)
      .required()
      .label('Title'),
    userIds: Joi.array()
      .min(1)
      .max(100)
      .unique()
      .items(
        Joi.objectId()
          .label('User Id')
      )
      .label('User Ids')
  });

const postMessageSchema = Joi.object({
  chatId: Joi.objectId()
    .required()
    .label('Chat Id'),
  messageBody: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .label('Message Body')
});

module.exports.startChatSchema = startChatSchema;
module.exports.postMessageSchema = postMessageSchema;
