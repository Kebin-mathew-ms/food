import env from './env.js';

/**
 * JWT configuration parameters.
 */
export const jwtConfig = {
  secret: env.jwtSecret,
  expiresIn: env.jwtExpiresIn,
};

export default jwtConfig;
