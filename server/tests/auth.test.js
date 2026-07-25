import { jest } from '@jest/globals';

// Mock database connection completely to bypass Prisma ESM require checks
jest.unstable_mockModule('../src/config/database.js', () => ({
  __esModule: true,
  prisma: {
    notifications: {
      findMany: jest.fn(async () => []),
      updateMany: jest.fn(async () => ({ count: 0 })),
    },
  },
  connectDatabase: jest.fn(async () => {}),
  disconnectDatabase: jest.fn(async () => {}),
}));

// Mock AuthRepository using local state
const usersDb = new Map();
const tokensDb = new Map();

jest.unstable_mockModule('../src/repositories/auth.repository.js', () => ({
  __esModule: true,
  default: {
    findUserById: jest.fn(async (id) => usersDb.get(id) || null),
    findUserByEmail: jest.fn(async (email) => {
      for (const user of usersDb.values()) {
        if (user.email === email) return user;
      }
      return null;
    }),
    findUserByPhone: jest.fn(async (phone) => {
      for (const user of usersDb.values()) {
        if (user.phone === phone) return user;
      }
      return null;
    }),
    createUser: jest.fn(async (userData) => {
      const id = `mock-uuid-${Date.now()}`;
      const user = { id, ...userData, email_verified: true, status: 'ACTIVE', created_at: new Date() };
      usersDb.set(id, user);
      return user;
    }),
    updateUser: jest.fn(async (id, userData) => {
      const user = usersDb.get(id);
      if (!user) throw new Error('User not found');
      const updated = { ...user, ...userData, updated_at: new Date() };
      usersDb.set(id, updated);
      return updated;
    }),
    saveRefreshToken: jest.fn(async (userId, token, expiresAt, deviceInfo, ip) => {
      const id = `token-uuid-${Date.now()}`;
      const record = { id, user_id: userId, token, expires_at: expiresAt, is_revoked: false };
      tokensDb.set(token, record);
      return record;
    }),
    findRefreshToken: jest.fn(async (token) => {
      const record = tokensDb.get(token);
      if (!record || record.is_revoked) return null;
      const user = usersDb.get(record.user_id);
      return { ...record, user };
    }),
    deleteRefreshToken: jest.fn(async (token) => {
      tokensDb.delete(token);
      return { count: 1 };
    }),
    deleteAllRefreshTokens: jest.fn(async (userId) => {
      for (const [key, value] of tokensDb.entries()) {
        if (value.user_id === userId) {
          tokensDb.set(key, { ...value, is_revoked: true });
        }
      }
      return { count: 1 };
    }),
    findUserByVerificationToken: jest.fn(async (token) => {
      for (const user of usersDb.values()) {
        if (user.verification_token === token) return user;
      }
      return null;
    }),
    findUserByResetToken: jest.fn(async (token) => {
      for (const user of usersDb.values()) {
        if (user.reset_token === token) return user;
      }
      return null;
    }),
  },
}));

// Asynchronously import app and supertest after mocks are set
const appModule = await import('../src/app.js');
const app = appModule.default;
const supertestModule = await import('supertest');
const request = supertestModule.default;

describe('🔐 Auth Module Integration Tests', () => {
  const testUser = {
    full_name: 'John Doe',
    email: 'john.doe@foodwaste.org',
    phone: '+15550999',
    password: 'Password123!',
    confirm_password: 'Password123!',
    role: 'DONOR',
  };

  let accessToken = '';
  let refreshToken = '';

  beforeAll(() => {
    process.env.REQUIRE_EMAIL_VERIFICATION = 'false';
  });

  it('1. Register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.email).toBe(testUser.email);
    expect(res.body.data).not.toHaveProperty('password');
  });

  it('2. Fail to register with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('3. Authenticate / Login user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user.email).toBe(testUser.email);

    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('4. Rotate JWT token pair via refresh-token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');

    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('5. Get current logged in user profile details', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email);
  });

  it('6. Block profile queries with missing/invalid headers', async () => {
    const res = await request(app)
      .get('/api/auth/profile');

    expect(res.statusCode).toBe(401);
  });

  it('6a. Get user notifications successfully', async () => {
    const res = await request(app)
      .get('/api/auth/notifications')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('6b. Mark user notifications as read successfully', async () => {
    const res = await request(app)
      .patch('/api/auth/notifications/read-all')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('7. Log out user session successfully', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
