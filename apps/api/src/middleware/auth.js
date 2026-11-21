const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');

const COOKIE_NAME = 'qb_session';

const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new ApiError(401, 'Please sign in to continue.');

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Your session has expired. Please sign in again.');
  }

  const user = await User.findById(payload.sub).select('name email role');
  if (!user) throw new ApiError(401, 'User account was not found.');
  req.user = user;
  next();
});

function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') return next(new ApiError(403, 'Admin access is required.'));
  return next();
}

module.exports = { requireAuth, requireAdmin, COOKIE_NAME };
