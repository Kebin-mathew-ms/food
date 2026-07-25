import { jest } from '@jest/globals';

// Local mock databases
const usersDb = new Map();
const ngosDb = new Map();
const settingsDb = new Map();

// Mock database connection
jest.unstable_mockModule('../src/config/database.js', () => ({
  __esModule: true,
  prisma: {
    users: {
      count: jest.fn(async () => 5),
      findMany: jest.fn(async () => Array.from(usersDb.values())),
      findUnique: jest.fn(async ({ where }) => usersDb.get(where.id) || null),
      update: jest.fn(async ({ where, data }) => {
        const record = usersDb.get(where.id);
        if (!record) throw new Error('Not found');
        const updated = { ...record, ...data };
        usersDb.set(where.id, updated);
        return updated;
      }),
    },
    ngos: {
      count: jest.fn(async () => 2),
      findMany: jest.fn(async () => Array.from(ngosDb.values())),
      findUnique: jest.fn(async ({ where }) => ngosDb.get(where.id) || null),
      update: jest.fn(async ({ where, data }) => {
        const record = ngosDb.get(where.id);
        if (!record) throw new Error('Not found');
        const updated = { ...record, ...data };
        ngosDb.set(where.id, updated);
        return updated;
      }),
    },
    volunteers: {
      count: jest.fn(async () => 1),
    },
    food_donations: {
      count: jest.fn(async () => 10),
      findMany: jest.fn(async () => []),
    },
    donation_requests: {
      count: jest.fn(async () => 3),
    },
    deliveries: {
      count: jest.fn(async () => 2),
      findMany: jest.fn(async () => []),
    },
    complaints: {
      count: jest.fn(async () => 1),
    },
    system_settings: {
      findMany: jest.fn(async () => Array.from(settingsDb.values())),
      upsert: jest.fn(async ({ where, update, create }) => {
        const key = where.setting_key;
        const val = update.setting_value;
        const record = { id: key, setting_key: key, setting_value: val };
        settingsDb.set(key, record);
        return record;
      }),
    },
    audit_logs: {
      create: jest.fn(async () => ({})),
    },
    notifications: {
      create: jest.fn(async () => ({})),
    },
  },
  connectDatabase: jest.fn(async () => {}),
  disconnectDatabase: jest.fn(async () => {}),
}));

// Mock Socket.io
jest.unstable_mockModule('../src/config/socket.js', () => ({
  __esModule: true,
  initSocketServer: jest.fn(() => ({})),
  getIO: jest.fn(() => ({})),
  broadcastToRoom: jest.fn(),
}));

// Seed mock users
const mockAdmin = {
  id: 'admin-user-uuid',
  full_name: 'System Admin',
  email: 'admin@foodplatform.org',
  role: 'ADMIN',
  status: 'ACTIVE',
};
const mockDonor = {
  id: 'donor-user-uuid',
  full_name: 'Seattle Bakery',
  email: 'bakery@seattle.com',
  role: 'DONOR',
  status: 'ACTIVE',
};
usersDb.set(mockAdmin.id, mockAdmin);
usersDb.set(mockDonor.id, mockDonor);

// Seed NGO
const mockNgo = {
  id: 'ngo-uuid',
  user_id: 'ngo-user-uuid',
  organization_name: 'Hope NGO',
  registration_number: 'REG-999-77',
  status: 'PENDING',
  verified: false,
};
ngosDb.set(mockNgo.id, mockNgo);

// Mock auth repository
jest.unstable_mockModule('../src/repositories/auth.repository.js', () => ({
  __esModule: true,
  default: {
    findUserById: jest.fn(async (id) => usersDb.get(id) || null),
  },
}));

// Asynchronously load Express app & supertest
const appModule = await import('../src/app.js');
const app = appModule.default;
const supertestModule = await import('supertest');
const request = supertestModule.default;
const jwtModule = await import('jsonwebtoken');
const jwt = jwtModule.default;
const jwtConfigModule = await import('../src/config/jwt.js');
const jwtConfig = jwtConfigModule.default;

describe('🔒 Administrative Module Integration Tests', () => {
  let adminToken = '';
  let donorToken = '';

  beforeAll(() => {
    adminToken = jwt.sign(
      { id: mockAdmin.id, email: mockAdmin.email, role: mockAdmin.role },
      jwtConfig.secret,
      { expiresIn: '1h' }
    );
    donorToken = jwt.sign(
      { id: mockDonor.id, email: mockDonor.email, role: mockDonor.role },
      jwtConfig.secret,
      { expiresIn: '1h' }
    );
  });

  it('1. Deny access to administrative routes for non-admins', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${donorToken}`);

    expect(res.statusCode).toBe(403); // Forbidden
  });

  it('2. Grant access and fetch dashboard metrics for administrators', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalUsers).toBe(5);
  });

  it('3. Retrieve list of active users with query criteria', async () => {
    const res = await request(app)
      .get('/api/admin/users?role=DONOR')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('4. Suspend a user account status successfully', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${mockDonor.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'INACTIVE' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('INACTIVE');
  });

  it('5. Approve NGO verification credentials successfully', async () => {
    const res = await request(app)
      .patch(`/api/admin/ngos/${mockNgo.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'VERIFIED', remarks: 'Compliance checks passed.' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('VERIFIED');
  });

  it('6. Modify global system configuration parameters', async () => {
    const res = await request(app)
      .put('/api/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        application_name: 'FoodSaver Pro',
        support_email: 'support@foodsaver.org',
        support_phone: '+15550999',
        max_image_size: 5,
        donation_expiry_hours: 24,
        volunteer_radius: 15,
        maintenance_mode: false,
        registration_toggle: true,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('7. Export daily/weekly report datasets logs', async () => {
    const res = await request(app)
      .post('/api/admin/reports/export')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        type: 'USERS',
        startDate: '2026-07-01',
        endDate: '2026-07-15',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('8. Fetch active coordinate telemetries for Leaflet live map', async () => {
    const res = await request(app)
      .get('/api/admin/live-map')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
