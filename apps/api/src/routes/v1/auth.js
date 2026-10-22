const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const User = require('../../models/User');
const env = require('../../config/env');
const { requireAuth, COOKIE_NAME } = require('../../middleware/auth');

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many sign-in attempts. Try again later.' },
});

function checkValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, 'Please check the submitted fields.', errors.array());
}

function sessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

router.post(
  '/register',
  authLimiter,
  [
    body('name').isString().trim().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail().isLength({ max: 254 }),
    body('password').isString().isLength({ min: 8, max: 72 }),
  ],
  asyncHandler(async (req, res) => {
    checkValidation(req);
    const email = req.body.email.toLowerCase();
    if (await User.exists({ email })) throw new ApiError(409, 'An account with this email already exists.');

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    let user;
    try {
      user = await User.create({ name: req.body.name.trim(), email, passwordHash, role: 'customer' });
    } catch (error) {
      if (error.code === 11000) throw new ApiError(409, 'An account with this email already exists.');
      throw error;
    }

    sessionCookie(res, signToken(user));
    res.status(201).json({
      success: true,
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    });
  })
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 1, max: 72 }),
  ],
  asyncHandler(async (req, res) => {
    checkValidation(req);
    const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+passwordHash');
    const valid = user && (await bcrypt.compare(req.body.password, user.passwordHash));
    if (!valid) throw new ApiError(401, 'Email or password is incorrect.');

    sessionCookie(res, signToken(user));
    res.json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: { user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } } });
  })
);

router.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.json({ success: true, data: { message: 'Signed out.' } });
});

module.exports = router;
