const express = require('express');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const User = require('../../models/User');
const env = require('../../config/env');
const { requireAuth, COOKIE_NAME } = require('../../middleware/auth');

const router = express.Router();
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many sign-in attempts. Try again later.' },
});

function sessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

// Google Identity Services sends an ID token. Verify its signature, issuer,
// expiry and audience on the server before using any profile information.
router.post('/google', authLimiter, asyncHandler(async (req, res) => {
  if (!env.GOOGLE_CLIENT_ID) throw new ApiError(503, 'Google sign-in is not configured on the server.');
  const idToken = req.body?.credential;
  if (typeof idToken !== 'string' || !idToken) throw new ApiError(400, 'Google credential is missing.');

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw new ApiError(401, 'Google sign-in could not be verified. Please try again.');
  }

  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new ApiError(401, 'A verified Google email is required.');
  }

  const email = payload.email.toLowerCase().trim();
  let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email }] }).select('+googleId');

  if (user) {
    // A verified Google email proves control of the matching email address.
    // Preserve existing roles (including admin); never grant admin from Google claims.
    if (user.googleId && user.googleId !== payload.sub) {
      throw new ApiError(409, 'This email is already linked to another Google account.');
    }
    if (!user.googleId) user.googleId = payload.sub;
    user.name = (payload.name || user.name).trim().slice(0, 100);
    await user.save();
  } else {
    user = await User.create({
      name: (payload.name || email.split('@')[0]).trim().slice(0, 100),
      email,
      googleId: payload.sub,
      role: 'customer',
    });
  }

  sessionCookie(res, signToken(user));
  res.json({
    success: true,
    data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
  });
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } },
  });
}));

router.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
  });
  res.json({ success: true, data: { message: 'Signed out.' } });
});

module.exports = router;
