const Joi = require('@hapi/joi');
const { BCRYPT_MAX_BYTES } = require('../config/auth-config');

const email = Joi.string()
  .email()
  .required()
  .label('Email');

const username = Joi.string()
  .alphanum()
  .min(4)
  .max(30)
  .required()
  .label('Username');

const name = Joi.string()
  .max(30)
  .required()
  .label('Name');

const password = Joi.string()
  .min(6)
  .max(parseInt(BCRYPT_MAX_BYTES), 'utf8')
  .regex(/^(?=\S*[a-z])(?=\S*[A-Z])(?=\S*\d)(?=\S*[^\w\s]).*$/)
  .label('Password')
  .error(
    new Error('password must be at least 6 characters. and must contain at least one lower case letter, one upper case letter, one digit and one special character.')
  );

const passwordConfirmation = Joi.valid(Joi.ref('password'))
  .required()
  .label('Password Confirmation');

const currentPassword = Joi.invalid(Joi.ref('password'))
  .required()
  .label('Current Password')
  .error(
    new Error('New Password must differ from the current password.')
  );

exports.userSignupSchema = Joi.object({
  email,
  password,
  passwordConfirmation,
  username,
  name
});

exports.userLoginSchema = Joi.object({
  email,
  password
});

exports.userChangePasswordSchema = Joi.object({
  currentPassword,
  password,
  passwordConfirmation
});

exports.userResetPasswordSchema = Joi.object({
  email
});

exports.password = password;
exports.passwordConfirmation = passwordConfirmation;
