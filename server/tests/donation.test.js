import { jest } from '@jest/globals';

// Mock database connection completely to bypass Prisma require checks
jest.unstable_mockModule('../src/config/database.js', () => ({
  __esModule: true,
  prisma: {},
  connectDatabase: jest.fn(async () => {}),
  disconnectDatabase: jest.fn(async () => {}),
}));

// Local Mock Data Stores
const donationsDb = new Map();
const usersDb = new Map();

// Seed mock donor for tests validation
const mockDonor = {
  id: 'donor-123',
  full_name: 'Test Donor',
  email: 'donor@foodwaste.org',
  role: 'DONOR',
  status: 'ACTIVE',
};
usersDb.set(mockDonor.id, mockDonor);

jest.unstable_mockModule('../src/repositories/auth.repository.js', () => ({
  __esModule: true,
  default: {
    findUserById: jest.fn(async (id) => usersDb.get(id) || null),
  },
}));

jest.unstable_mockModule('../src/repositories/donation.repository.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(async (data) => {
      const id = `donation-uuid-${Date.now()}`;
      const record = { id, ...data, donation_images: [], created_at: new Date() };
      donationsDb.set(id, record);
      return record;
    }),
    findById: jest.fn(async (id) => {
      const donation = donationsDb.get(id);
      if (!donation || donation.deleted_at) return null;
      return donation;
    }),
    update: jest.fn(async (id, data) => {
      const record = donationsDb.get(id);
      if (!record) throw new Error('Not found');
      const updated = { ...record, ...data, updated_at: new Date() };
      donationsDb.set(id, updated);
      return updated;
    }),
    delete: jest.fn(async (id) => {
      const record = donationsDb.get(id);
      if (record) {
        donationsDb.set(id, { ...record, deleted_at: new Date() });
      }
      return { count: 1 };
    }),
    findAll: jest.fn(async () => Array.from(donationsDb.values()).filter((d) => !d.deleted_at)),
    countAll: jest.fn(async () => Array.from(donationsDb.values()).filter((d) => !d.deleted_at).length),
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

describe('🍅 Donor Module API Integration Tests', () => {
  let donorToken = '';
  let testDonationId = '';

  const testDonation = {
    food_name: 'Surplus Sandwiches',
    food_category: 'Cooked Food',
    food_type: 'VEG',
    description: 'Fresh vegetarian sandwiches from corporate lunch.',
    quantity: 15,
    quantity_unit: 'items',
    number_of_people: 15,
    prepared_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    expiry_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hrs from now
    pickup_time: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hr from now
    pickup_address: '100 Broadway, NY',
    pickup_city: 'New York',
    pickup_state: 'NY',
    pickup_country: 'US',
  };

  beforeAll(() => {
    // Generate valid mock JWT token for the Donor
    donorToken = jwt.sign(
      { id: mockDonor.id, email: mockDonor.email, role: mockDonor.role },
      jwtConfig.secret,
      { expiresIn: '1h' }
    );
  });

  it('1. Prevent unauthenticated users from listing or creating donations', async () => {
    const res = await request(app).post('/api/donations').send(testDonation);
    expect(res.statusCode).toBe(401);
  });

  it('2. Allow authenticated donor to create a food donation listing', async () => {
    const res = await request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${donorToken}`)
      .send(testDonation);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.food_name).toBe(testDonation.food_name);

    testDonationId = res.body.data.id;
  });

  it('3. Fail donation listing creation on validation errors (e.g. negative quantity)', async () => {
    const res = await request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({ ...testDonation, quantity: -5 });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('4. Retrieve donation details by listing ID', async () => {
    const res = await request(app)
      .get(`/api/donations/${testDonationId}`)
      .set('Authorization', `Bearer ${donorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(testDonationId);
  });

  it('5. Update donation listing parameters successfully', async () => {
    const res = await request(app)
      .put(`/api/donations/${testDonationId}`)
      .set('Authorization', `Bearer ${donorToken}`)
      .send({ ...testDonation, food_name: 'Premium Veggie Sandwiches' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.food_name).toBe('Premium Veggie Sandwiches');
  });

  it('6. Cancel an active donation listing', async () => {
    const res = await request(app)
      .patch(`/api/donations/${testDonationId}/cancel`)
      .set('Authorization', `Bearer ${donorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('CANCELLED');
  });

  it('7. Delete donation listing successfully (soft-delete)', async () => {
    const res = await request(app)
      .delete(`/api/donations/${testDonationId}`)
      .set('Authorization', `Bearer ${donorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
