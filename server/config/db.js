import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the connection string defined in the environment.
 * This helper centralizes connection logic so it can easily be reused by
 * `server.js` and tests. When `DB_URI` is undefined the promise will
 * reject, allowing the caller to handle the error gracefully.
 */
export default async function connectDB() {
  const uri = process.env.DB_URI;
  if (!uri) {
    throw new Error('DB_URI is not defined in environment variables');
  }
  try {
    // The mongoose options `useNewUrlParser` and `useUnifiedTopology` are
    // enabled by default in recent versions, but they remain here to
    // explicitly document the connection behaviour.
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected to MongoDB at ${uri}`);
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    throw err;
  }
}