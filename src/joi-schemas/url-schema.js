const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const {
  EMAIL_VERIFICATION_TOKEN_BYTES,
  PASSWORD_RESET_BYTES,
  SIGNATURE_BYTES
} = require('../config/auth-config');
const { password, passwordConfirmation } = require('./user-schema');

const id = Joi.objectId()
  .required()
  .label('User Id');

const verifyToken = Joi.string()
  .required()
  .length(+EMAIL_VERIFICATION_TOKEN_BYTES)
  .label('Token');

const resetToken = Joi.string()
  .required()
  .length(+PASSWORD_RESET_BYTES)
  .label('Token');

const expires = Joi.date()
  .timestamp()
  .required()
  .label('Expiration Time');

const signature = Joi.string()
  .required()
  .length(+SIGNATURE_BYTES)
  .label('Signature');

exports.verifyEmailSchema = Joi.object({
  id,
  token: verifyToken,
  expires,
  signature
});

exports.resetPasswordSchema = Joi.object({
  id,
  token: resetToken,
  signature,
  password,
  passwordConfirmation
});
