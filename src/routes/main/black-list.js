const { Router } = require('express');

const { catchAsync } = require('../../middleware/errors');
const { auth } = require('../../middleware/auth');

const router = Router();

// PATCH => /blacklist/add
router.get(
  '/add',
  auth,
  catchAsync(async (req, res) => {})
);

// PATCH => /blacklist/remove
router.get(
  '/remove',
  auth,
  catchAsync(async (req, res) => {})
);

// PATCH => /blacklist/edit
router.get(
  '/edit',
  auth,
  catchAsync(async (req, res) => {})
);

// PATCH => /blacklist/clear
router.get(
  '/clear',
  auth,
  catchAsync(async (req, res) => {})
);
module.exports = router;
