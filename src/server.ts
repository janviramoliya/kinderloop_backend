import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/db';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

const start = async () => {
  await connectDB(MONGO_URI);
};

start();
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/**
 * Handle unhandled promise rejections.
 * This catches errors in async code that aren't caught elsewhere,
 * logs them, and gracefully shuts down the server.
 */
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  server.close(() => {
    process.exit(1);
  });
});

/**
 * Handle uncaught exceptions.
 * This catches synchronous errors not handled anywhere else,
 * logs them, and exits the process to avoid unknown state.
 */
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

/**
 * Handle SIGTERM (e.g., from process managers or cloud platforms).
 * Gracefully shuts down the server.
 */
process.on('SIGTERM', () => {
  console.info('SIGTERM received. Shutting down gracefully.');
  server.close(() => {
    process.exit(0);
  });
});
