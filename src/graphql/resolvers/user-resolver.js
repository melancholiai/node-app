const Joi = require('@hapi/joi');

const AuthUser = require('../../models/auth-user');
const {
  userSignupSchema,
  userLoginSchema
} = require('../../joi-schemas/user-schema');
const { objectIdSchema } = require('../../joi-schemas/utils');
const auth = require('../../auth/auth-garaphql');

module.exports = {
  Query: {
    users: (root, args, context, info) => {
      // TODO: projection, pagination
      return AuthUser.find();
    },
    user: async (root, args, context, info) => {
      // TODO: projection, sanitization
      // validate the objectId
      await Joi.validate(args, objectIdSchema, { abortEarly: false });

      // find the user by id
      return AuthUser.findById(args.id);
    },
    basicInfo: (root, args, context, info) => {
      return AuthUser.findById(context.req.session.userId);
    }
  },
  Mutation: {
    signUp: async (root, args, context, info) => {
      await Joi.validate(args, userSignupSchema, { abortEarly: false });

      const user = AuthUser.create(args);

      return user;
    },
    login: async (root, args, context, info) => {
      await Joi.validate(args, userLoginSchema, { abortEarly: false });
      const { email, password } = args;
      const user = await auth.attemptSignIn(email, password);

      // once the request is done the session middleware will set a cookie
      context.req.session.userId = user.id;

      return user;
    },
    signOut: (root, args, context, info) => {
      return auth.attemptSignOut(context.req, context.res);
    }
  },
  User: {
    chats: async (user, args, context, info) => {
      return (await user.populate('chats').execPopulate()).chats;
    }
  }
};
