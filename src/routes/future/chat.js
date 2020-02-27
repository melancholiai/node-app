const { Router } = require('express');

const { catchAsync } = require('../../middleware/errors');
const { auth } = require('../../middleware/auth');
const AuthUser = require('../../models/auth-user');
const Chat = require('../../models/future/chat');
const Message = require('../../models/future/message');
const {
  startChatSchema,
  postMessageSchema
} = require('../../joi-schemas/chat-schema');
const { objectIdSchema } = require('../../joi-schemas/utils');
const { BadRequest, Unauthorized } = require('../../errors');
const { existingDocuments } = require('../../services/mongo/mongo-actions');

const router = Router();

// POST => /chat/create
router.post(
  '/create',
  auth,
  catchAsync(async (req, res) => {
    const { authUserId } = req.session;
    const { userIds, title } = req.body;
    await startChatSchema.validateAsync(req.body, { abortEarly: false });

    // validate the creating user is not on the body array
    if (userIds.includes(authUserId)) {
      throw new BadRequest('Only unique users allowed');
    }

    // validate every user id is a valid user in the database by finding and counting them all against entered users
    if (!await existingDocuments(AuthUser, '_id', userIds)) {
      throw new BadRequest('One or more users entered are invalid');
    }

    // push the user who starts the chat into the whole userIds array
    userIds.push(authUserId);
    const chat = await Chat.create({ title, users: userIds });
    
    // update each user with the new chat
    await AuthUser.updateMany(
      { _id: { $in: userIds } }, // for all the users who's id is IN the userIds collection
      {
        $push: { chats: chat } // PUSH under the chats property the newly created chat object - mongo knows to take out of the whole chat object only the id
      }
    );
    res.status(201).json(chat);
  })
);

// GET => /chat/:chatId
router.get(
  '/:chatId',
  auth,
  catchAsync(async (req, res) => {
    const { userId } = req.session;
    const { chatId } = req.params;
    await objectIdSchema.validateAsync({ id: chatId });

    // check authorized user
    await isChatMember(userId, chatId);

    // get the chat and it's messages
    const chat = await Chat.findById(chatId);
    const messages = await Message.find({ chat: chatId });
    res.status(200).json({ ...chat._doc, messages });
  })
);

// GET => /chat/:chatId
router.post(
  '/:chatId',
  auth,
  catchAsync(async (req, res) => {
    const { userId } = req.session;
    const chatId = req.params.chatId;
    const messageBody = req.body.message;
    await postMessageSchema.validateAsync(
      { chatId, messageBody },
      { abortEarly: false }
    );

    // check authorized user
    await isChatMember(userId, chatId);

    const message = await Message.create({
      chat: chatId,
      sender: userId,
      body: messageBody
    });
    // update the relevant chat for it's new last message prop
    await Chat.findOneAndUpdate(
      { _id: chatId },
      { $set: { lastMessage: message } },
      { new: true }
    );
    res.status(201).json(message);
  })
);

//#region Helper Methods

const isChatMember = async (userId, chatId) => {
  const chat = await Chat.findById(chatId);
  if (!chat || !chat.users.includes(userId)) {
    throw new Unauthorized('only members of the chat can enter this endpoint.');
  }
};

//#endregion

module.exports = router;
