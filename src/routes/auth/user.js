const { Router } = require('express');

const { catchAsync } = require('../../middleware/errors');
const { guest, auth } = require('../../middleware/auth');
const {
  attemptSignOut,
  attemptSignIn,
  attemptLogin,
  attemptRegister
} = require('../../util/auth');
const AuthUser = require('../../models/auth-user');
const User = require('../../models/user');
const {
  userLoginSchema,
  userSignupSchema
} = require('../../joi-schemas/user-schema');
const {
  transactionOperations
} = require('../../services/mongo/transaction-operations');
const { objectIdSchema } = require('../../joi-schemas/utils');
const { CustomHttpError } = require('../../errors');
const { sendMail } = require('../../services/mail/mail');
const { verificationMail } = require('../../services/mail/mail-templates');
const { ValidateUrl } = require('../../services/cryptography');
const { BadRequest } = require('../../errors');
const { verifyEmailSchema } = require('../../joi-schemas/url-schema');

const router = Router();

// POST => /login
router.post(
  '/login',
  guest,
  catchAsync(async (req, res) => {
    await userLoginSchema.validateAsync(req.body, { abortEarly: false });
    const { email, password } = req.body;

    // validates a valid non taken email and username
    const authUser = await attemptSignIn(email, password);

    // setting the session cookie on the requesting user
    if (!attemptLogin(req, authUser.id)) {
      throw new CustomHttpError('something went wrong, please try again.', 500);
    }

    // update the session with the User model id
    req.session.userId = (await User.getUserFromAuthId(authUser.id)).id;
    res.status(200).json(authUser);
  })
);

// POST => /register
router.post(
  '/register',
  guest,
  catchAsync(async (req, res) => {
    await userSignupSchema.validateAsync(req.body, { abortEarly: false });
    const { email, username } = req.body;
    // checks the email and username aren't taken
    await attemptRegister(email, username);
    const user = new AuthUser(req.body);
    const verificationUrl = user.createVerificationUrl();
    console.log(verificationUrl);
    const template = verificationMail(user.email, verificationUrl);

    // send confirmation mail
    //const mailResponse = await sendMail(template);
    mailResponse = true;

    if (!mailResponse) {
      throw new CustomHttpError(mailResponse, 500);
    }

    // save the new user only once the email was sent
    await user.save();
    res.status(201).json(user);
  })
);

// POST => /logout
router.post(
  '/logout',
  auth,
  catchAsync(async (req, res) => {
    res.status(200).json({ message: await attemptSignOut(req, res) });
  })
);

// POST => /verify
router.post(
  '/verify',
  guest,
  catchAsync(async (req, res) => {
    await verifyEmailSchema.validateAsync(req.query, { abortEarly: false });
    const { id } = req.query;
    const user = await AuthUser.findById(id);

    if (!user || !ValidateUrl(req.originalUrl, req.query)) {
      throw new BadRequest('Invalid activation link.');
    }

    if (user.verifiedAt) {
      throw new BadRequest('Account is already active.');
    }

    const setAuthUserVerifiedAt = async session => {
      await AuthUser.findByIdAndUpdate(id, {
        verifiedAt: Date.now()
      }).session(session);
    }

    const createUserModel = async session => {
      await User.create([{ authUserId: id }], { session });
    }
      
    await transactionOperations([setAuthUserVerifiedAt, createUserModel]);

    res.status(200).json({ message: 'Account is Activated' });
  })
);

// GET => /user/:userId
router.get(
  '/:userId',
  auth,
  catchAsync(async (req, res) => {
    // TODO: projection, sanitization
    const id = req.params.userId;
    await objectIdSchema.validateAsync({ id });
    res.status(200).json(await AuthUser.findById(id));
  })
);

module.exports = router;
