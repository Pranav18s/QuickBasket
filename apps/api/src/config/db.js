/**
 * apps/api/src/config/db.js
 *
 * Mongoose connection helper.
 * Call connectDB() once at startup. Logs success or error and exits on failure
 * so the process doesn't silently run without a database.
 */

const mongoose = require('mongoose');
const env = require('./env');

/**
 * Connect to MongoDB using the URI from the environment.
 * @returns {Promise<void>}
 */
async function connectDB() {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DB] Connection error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { connectDB };
