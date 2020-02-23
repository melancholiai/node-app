const mongoose = require('mongoose');
const { Router } = require('express');

const { catchAsync } = require('../../middleware/errors');
const { guest, auth } = require('../../middleware/auth');
const AuthUser = require('../../models/auth-user');
const { userChangePasswordSchema } = require('../../joi-schemas/user-schema');
const { CustomHttpError, Unauthorized, BadRequest } = require('../../errors');
const { attemptSignOut } = require('../../util/auth');
const { resetPasswordSchema } = require('../../joi-schemas/url-schema');
const PasswordReset = require('../../models/password-reset');
const { userResetPasswordSchema } = require('../../joi-schemas/user-schema');
const { ValidateUrl } = require('../../services/cryptography');
const { sendMail } = require('../../services/mail/mail');
const { resetPasswordMail } = require('../../services/mail/mail-templates');

const router = Router();

// PATCH => /auth/password/change
router.patch(
  '/change',
  auth,
  catchAsync(async (req, res) => {
    const { userId } = req.session;
    const user = await AuthUser.findById(userId);
    if (!user) {
      throw new BadRequest("Could not find user's account, please try again.");
    }

    const { currentPassword, newPassword, newPasswordConfirmation } = req.body;
    if (!(await user.matchesPassword(currentPassword))) {
      throw new Unauthorized('Wrong Password.');
    }

    await userChangePasswordSchema.validateAsync(
      {
        currentPassword,
        password: newPassword,
        passwordConfirmation: newPasswordConfirmation
      },
      { abortEarly: false }
    );

    await user.changePassword(newPassword);

    await AuthUser.findByIdAndUpdate(userId, { password: user.password });

    // log the user out: deletes the cookie
    await attemptSignOut(req, res);

    res.status(200).json({ message: 'password changed successfully' });
  })
);

// POST => /auth/password/forgot
router.post(
  '/forgot',
  guest,
  catchAsync(async (req, res) => {
    await userResetPasswordSchema.validateAsync(req.body);
    const { email } = req.body;
    const user = await AuthUser.findOne({ email });

    if (!user) {
      throw new BadRequest('Could not find requested user.');
    }

    const passwordReset = new PasswordReset({ userId: user.id });
    const resetUrl = passwordReset.createResetPasswordUrl();
    const template = resetPasswordMail(user.email, resetUrl);
    const mailResponse = await sendMail(template);
    if (!mailResponse) {
      throw new CustomHttpError(mailResponse, 500);
    }
    await passwordReset.save();
    res
      .status(201)
      .json({ message: 'Password reset request has been sent to your email.' });
  })
);

// POST => /auth/password/reset
router.post(
  '/reset',
  catchAsync(async (req, res) => {
    const { query, body } = req;
    await resetPasswordSchema.validateAsync(
      { ...query, ...body },
      { abortEarly: false }
    );
    const { id } = query;
    const user = await AuthUser.findById(id);
    if (!user) {
      throw new BadRequest('Could not find the requested user.');
    }
    const latestPasswordReset = await PasswordReset.findOne({
      userId: id
    }).sort('-createdAt');
    if (
      !latestPasswordReset ||
      !latestPasswordReset.isValid() ||
      !ValidateUrl(req.originalUrl, query)
    ) {
      throw new BadRequest('Invalid password reset link.');
    }

    if (await user.matchesPassword(body.password)) {
      throw new BadRequest(
        'New Password must differ from the current password.'
      );
    }

    await user.changePassword(body.password);

    // two database operation that entwined with each other, if one fails undo the other
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await AuthUser.findByIdAndUpdate(id, { password: user.password }).session(
        session
      );
      await PasswordReset.findByIdAndUpdate(latestPasswordReset.id, {
        used: true
      }).session(session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw new CustomHttpError('Something went wrong', 500);
    } finally {
      session.endSession();
    }

    res.status(200).json({ message: 'Password reset successfuly' });
  })
);

module.exports = router;
