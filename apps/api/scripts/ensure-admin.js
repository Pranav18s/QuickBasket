require('../src/config/env');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');

async function main() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) in the environment.');
  }

  await connectDB();
  const email = ADMIN_EMAIL.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.findOneAndUpdate(
    { email },
    { $set: { name: ADMIN_NAME.trim(), email, passwordHash, role: 'admin' } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
  console.log(`Admin account ensured for ${email}. No password was printed.`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('[Admin seed] Failed:', error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
