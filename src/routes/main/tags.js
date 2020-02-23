const { Router } = require('express');

const { catchAsync } = require('../../middleware/errors');
const { auth } = require('../../middleware/auth');
const Tag = require('../../models/tag');

const router = Router();

// GET => /tags
router.get(
  '/',
  auth,
  catchAsync(async (req, res) => {
    res.status(200).json(await Tag.find());
  })
);

module.exports = router;
