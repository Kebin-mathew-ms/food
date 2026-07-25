import { jest } from '@jest/globals';

// Seed mock data records
const mockVolunteers = [
  {
    id: 'vol-1',
    user_id: 'vol-user-1',
    online_status: 'ONLINE',
    operating_radius: 15.0,
    current_latitude: 47.6080,
    current_longitude: -122.3350,
    user: { full_name: 'David Volunteer', email: 'david@volunteer.com' },
    deliveries: [],
  },
];

const mockUser = {
  id: 'admin-user-uuid',
  full_name: 'System Admin',
  email: 'admin@foodplatform.org',
  role: 'ADMIN',
  status: 'ACTIVE',
};

// Mock database connection
jest.unstable_mockModule('../src/config/database.js', () => ({
  __esModule: true,
  prisma: {
    $queryRaw: jest.fn(async () => [{ 1: 1 }]),
    users: {
      findMany: jest.fn(async () => []),
      findUnique: jest.fn(async ({ where }) => {
        if (where.id === 'vol-user-1') {
          return { id: 'vol-user-1', email: 'david@volunteer.com', full_name: 'David Volunteer' };
        }
        return mockUser;
      }),
    },
    food_donations: {
      findMany: jest.fn(async () => []),
      update: jest.fn(async () => ({})),
    },
    complaints: {
      findMany: jest.fn(async () => []),
    },
    volunteers: {
      findMany: jest.fn(async () => mockVolunteers),
    },
    deliveries: {
      findUnique: jest.fn(async () => ({
        id: 'del-uuid-123',
        donation_request: {
          donation: {
            id: 'don-1',
            food_name: 'Fruit Salad Box',
            pickup_latitude: 47.6062,
            pickup_longitude: -122.3321,
          },
        },
      })),
      update: jest.fn(async () => ({})),
    },
    notifications: {
      create: jest.fn(async () => ({ id: 'notif-1', created_at: new Date() })),
      deleteMany: jest.fn(async () => ({ count: 5 })),
    },
  },
  connectDatabase: jest.fn(async () => {}),
  disconnectDatabase: jest.fn(async () => {}),
}));

// Mock auth repository
jest.unstable_mockModule('../src/repositories/auth.repository.js', () => ({
  __esModule: true,
  default: {
    findUserById: jest.fn(async (id) => {
      if (id === 'vol-user-1') {
        return { id: 'vol-user-1', email: 'david@volunteer.com', full_name: 'David Volunteer', role: 'VOLUNTEER' };
      }
      return mockUser;
    }),
  },
}));

// Mock Socket.io
jest.unstable_mockModule('../src/config/socket.js', () => ({
  __esModule: true,
  initSocketServer: jest.fn(() => ({})),
  getIO: jest.fn(() => ({})),
  broadcastToRoom: jest.fn(),
}));

// Mock Nodemailer email transport
jest.unstable_mockModule('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(() => ({
      sendMail: jest.fn(async () => ({ messageId: 'mock-msg-123' })),
    })),
  },
}));

// Asynchronously load supertest & express application
const appModule = await import('../src/app.js');
const app = appModule.default;
const supertestModule = await import('supertest');
const request = supertestModule.default;
const jwtModule = await import('jsonwebtoken');
const jwt = jwtModule.default;
const jwtConfigModule = await import('../src/config/jwt.js');
const jwtConfig = jwtConfigModule.default;
const assignmentServiceModule = await import('../src/services/assignment.service.js');
const assignmentService = assignmentServiceModule.default;

describe('⚡ Production Grade Optimizations Integration Tests', () => {
  let authToken = '';

  beforeAll(() => {
    authToken = jwt.sign(
      { id: mockUser.id, email: mockUser.email, role: mockUser.role },
      jwtConfig.secret,
      { expiresIn: '1h' }
    );
  });

  it('1. Verify health status returns UP with database and socket status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.services.database).toBe('UP');
  });

  it('2. Verify metrics status returns RSS memory and load metrics details', async () => {
    const res = await request(app).get('/api/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.body.memory).toBeDefined();
    expect(res.body.system).toBeDefined();
  });

  it('3. Retrieve advanced debounced global search coordinates query results', async () => {
    const res = await request(app)
      .get('/api/search/global?query=Bakery')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.users).toBeDefined();
  });

  it('4. Smart volunteer matching selects nearest available online candidate', async () => {
    const bestMatch = await assignmentService.autoAssignVolunteer('del-uuid-123');
    expect(bestMatch).toBeDefined();
    expect(bestMatch.id).toBe('vol-1');
  });
});
