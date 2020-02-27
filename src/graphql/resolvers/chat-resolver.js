const Joi = require('@hapi/joi');
const { UserInputError } = require('apollo-server-express');

const { startChatSchema } = require('../../joi-schemas/chat-schema');
const AuthUser = require('../../models/auth-user');
const Chat = require('../../models/future/chat');
const Message = require('../../models/future/message');
const { existingDocuments } = require('../../services/mongo/mongo-actions');

module.exports = {
  Query: {},
  Mutation: {
    startChat: async (root, args, context, info) => {
      const { authUserId } = context.req.session;
      const { userIds, title } = args;
      await Joi.validate(args, startChatSchema(authUserId), {
        abortEarly: false
      });

      // validate every user id is a valid user in the database by finding and counting them all against entered users

      if (!(await existingDocuments(AuthUser, '_id', userIds))) {
        throw UserInputError('One or more users entered are invalid');
      }

      // push the user who starts the chat into the whole userIds array
      userIds.push(authUserId);

      // create the chat
      const chat = await Chat.create({ title, users: userIds });

      // update each user with the new chat
      await AuthUser.updateMany(
        { _id: { $in: userIds } }, // for all the users who's id is IN the userIds collection
        {
          $push: { chats: chat } // PUSH under the chats property the newly created chat object - mongo knows to take out of the whole chat object only the id
        }
      );

      return chat;
    }
  },
  Chat: {
    users: async (chat, args, context, info) => {
      return (await chat.populate('users').execPopulate()).users;
    },
    messages: (chat, args, context, info) => {
      // TODO: pagination, projection
      Message.find({ chat: chat.id });
    },
    lastMessage: async (chat, args, context, info) => {
      return (await chat.populate('lastMessage').execPopulate()).lastMessage;
    }
  }
};
