import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT, 10) || 5000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey12345!',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
};

// Check critical variables
if (!env.databaseUrl) {
  console.warn('WARNING: DATABASE_URL variable is not set. Ensure database connects properly.');
}

export default env;
