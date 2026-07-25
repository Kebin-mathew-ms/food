import { jest } from '@jest/globals';

// Local stores for mock verification tests
const ngosDb = new Map();
const requestsDb = new Map();
const donationsDb = new Map();
const usersDb = new Map();

// Mock database connection
jest.unstable_mockModule('../src/config/database.js', () => ({
  __esModule: true,
  prisma: {
    ngos: {
      findUnique: jest.fn(async ({ where }) => {
        return Array.from(ngosDb.values()).find((n) => n.user_id === where.user_id) || null;
      }),
      update: jest.fn(async ({ where, data }) => {
        const record = Array.from(ngosDb.values()).find((n) => n.user_id === where.user_id);
        if (!record) throw new Error('Not found');
        const updated = { ...record, ...data };
        ngosDb.set(record.id, updated);
        return updated;
      }),
    },
    food_donations: {
      findMany: jest.fn(async () => {
        return Array.from(donationsDb.values());
      }),
      updateMany: jest.fn(async () => ({ count: 1 })),
      update: jest.fn(async ({ where, data }) => {
        const record = donationsDb.get(where.id);
        if (!record) throw new Error('Not found');
        const updated = { ...record, ...data };
        donationsDb.set(where.id, updated);
        return updated;
      }),
    },
    donation_requests: {
      groupBy: jest.fn(async () => []),
      count: jest.fn(async () => 0),
      findMany: jest.fn(async () => []),
      create: jest.fn(async ({ data }) => {
        const id = `request-uuid-${Date.now()}`;
        const record = { id, ...data, request_status: 'PENDING', created_at: new Date() };
        requestsDb.set(id, record);
        return record;
      }),
    },
    notifications: {
      create: jest.fn(async () => {}),
    },
    audit_logs: {
      create: jest.fn(async () => {}),
    },
  },
  connectDatabase: jest.fn(async () => {}),
  disconnectDatabase: jest.fn(async () => {}),
}));

// Seed mock user (NGO role)
const mockNgoUser = {
  id: 'ngo-user-uuid',
  full_name: 'Hope Kitchen NGO',
  email: 'hope@kitchen.org',
  role: 'NGO',
  status: 'ACTIVE',
};
usersDb.set(mockNgoUser.id, mockNgoUser);

// Seed mock donation with a valid UUID
const mockDonation = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  donor_id: 'donor-uuid',
  food_name: 'Surplus Rice Cups',
  food_category: 'Cooked Food',
  food_type: 'VEG',
  quantity: 50,
  quantity_unit: 'cups',
  status: 'AVAILABLE',
  expiry_time: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
  pickup_latitude: 40.7128,
  pickup_longitude: -74.0060,
};
donationsDb.set(mockDonation.id, mockDonation);

jest.unstable_mockModule('../src/repositories/auth.repository.js', () => ({
  __esModule: true,
  default: {
    findUserById: jest.fn(async (id) => usersDb.get(id) || null),
  },
}));

jest.unstable_mockModule('../src/repositories/ngo.repository.js', () => ({
  __esModule: true,
  default: {
    findByUserId: jest.fn(async (userId) => {
      const record = Array.from(ngosDb.values()).find((n) => n.user_id === userId);
      return record || null;
    }),
    findById: jest.fn(async (id) => ngosDb.get(id) || null),
    upsert: jest.fn(async (userId, data) => {
      const existing = Array.from(ngosDb.values()).find((n) => n.user_id === userId);
      const id = existing ? existing.id : `ngo-profile-uuid-${Date.now()}`;
      const record = { id, user_id: userId, ...data };
      ngosDb.set(id, record);
      return record;
    }),
    getDashboardStats: jest.fn(async () => ({
      APPROVED: 0,
      PENDING: 1,
      REJECTED: 0,
      COMPLETED: 0,
      meals: 0,
      people: 0,
    })),
  },
}));

jest.unstable_mockModule('../src/repositories/donation.repository.js', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(async (id) => donationsDb.get(id) || null),
  },
}));

jest.unstable_mockModule('../src/repositories/request.repository.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(async (data) => {
      const id = `request-uuid-${Date.now()}`;
      const record = { id, ...data, request_status: 'PENDING', created_at: new Date() };
      requestsDb.set(id, record);
      return record;
    }),
    findById: jest.fn(async (id) => {
      const record = requestsDb.get(id);
      if (!record) return null;
      return {
        ...record,
        donation: {
          id: mockDonation.id,
          donor_id: mockDonation.donor_id,
          food_name: mockDonation.food_name,
        },
      };
    }),
    findActiveRequest: jest.fn(async (ngoId, donationId) => {
      return Array.from(requestsDb.values()).find(
        (r) => r.ngo_id === ngoId && r.donation_id === donationId && r.request_status === 'PENDING'
      ) || null;
    }),
    updateStatus: jest.fn(async (id, status) => {
      const record = requestsDb.get(id);
      if (!record) throw new Error('Not found');
      const updated = { ...record, request_status: status, updated_at: new Date() };
      requestsDb.set(id, updated);
      return {
        ...updated,
        donation: {
          id: mockDonation.id,
          donor_id: mockDonation.donor_id,
          food_name: mockDonation.food_name,
        },
      };
    }),
  },
}));

// Asynchronously load app, supertest, and jwt dependencies
const appModule = await import('../src/app.js');
const app = appModule.default;
const supertestModule = await import('supertest');
const request = supertestModule.default;
const jwtModule = await import('jsonwebtoken');
const jwt = jwtModule.default;
const jwtConfigModule = await import('../src/config/jwt.js');
const jwtConfig = jwtConfigModule.default;

describe('🤝 NGO Module API Integration Tests', () => {
  let ngoToken = '';
  let testRequestId = '';

  beforeAll(() => {
    // Generate valid mock JWT token for verified/unverified NGO role
    ngoToken = jwt.sign(
      { id: mockNgoUser.id, email: mockNgoUser.email, role: mockNgoUser.role },
      jwtConfig.secret,
      { expiresIn: '1h' }
    );
  });

  it('1. Reject profiles upsert if invalid input details are provided', async () => {
    const res = await request(app)
      .put('/api/ngo/profile')
      .set('Authorization', `Bearer ${ngoToken}`)
      .send({ organization_name: '' }); // Registration number missing and organization_name empty

    expect(res.statusCode).toBe(400);
  });

  it('2. Complete NGO profile info successfully', async () => {
    const res = await request(app)
      .put('/api/ngo/profile')
      .set('Authorization', `Bearer ${ngoToken}`)
      .send({
        organization_name: 'Hope Kitchen Charity',
        registration_number: 'NGO-REG-9988-77',
        organization_type: 'NGO',
        phone: '+15550999',
        email: 'hope@kitchen.org',
        operating_radius: 15.0,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.organization_name).toBe('Hope Kitchen Charity');
  });

  it('3. Deny access to nearby discovery for non-verified NGOs', async () => {
    const res = await request(app)
      .get('/api/donations/nearby')
      .set('Authorization', `Bearer ${ngoToken}`);

    // Since profile status is PENDING by default, verification state returns FORBIDDEN 403
    expect(res.statusCode).toBe(403);
  });

  it('4. Allow verified NGO to discover nearby food listings', async () => {
    // Manually verified NGO status
    const profile = Array.from(ngosDb.values())[0];
    profile.status = 'VERIFIED';
    profile.verified = true;
    ngosDb.set(profile.id, profile);

    const res = await request(app)
      .get('/api/donations/nearby')
      .set('Authorization', `Bearer ${ngoToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('5. Successfully submit a claim request for available food donation', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${ngoToken}`)
      .send({
        donation_id: mockDonation.id,
        remarks: 'Need food for evening community dinner',
        expected_pickup_time: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
        estimated_arrival_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.donation_id).toBe(mockDonation.id);

    testRequestId = res.body.data.id;
  });

  it('6. Block duplicate requests submission for the same listing', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${ngoToken}`)
      .send({
        donation_id: mockDonation.id,
        expected_pickup_time: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
        estimated_arrival_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      });

    expect(res.statusCode).toBe(409); // Conflict: already requested
  });

  it('7. Cancel a pending food request successfully', async () => {
    const res = await request(app)
      .patch(`/api/requests/${testRequestId}/cancel`)
      .set('Authorization', `Bearer ${ngoToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
