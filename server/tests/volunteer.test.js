import { jest } from '@jest/globals';

// Local mock databases
const volunteersDb = new Map();
const deliveriesDb = new Map();
const logsDb = new Map();
const usersDb = new Map();

// Mock database connection
jest.unstable_mockModule('../src/config/database.js', () => ({
  __esModule: true,
  prisma: {
    volunteers: {
      findUnique: jest.fn(async ({ where }) => {
        return Array.from(volunteersDb.values()).find((v) => v.user_id === where.user_id) || null;
      }),
      update: jest.fn(async ({ where, data }) => {
        const record = Array.from(volunteersDb.values()).find((v) => v.user_id === where.user_id);
        if (!record) throw new Error('Not found');
        const updated = { ...record, ...data };
        volunteersDb.set(record.id, updated);
        return updated;
      }),
    },
    deliveries: {
      findUnique: jest.fn(async ({ where }) => {
        return deliveriesDb.get(where.id) || null;
      }),
      update: jest.fn(async ({ where, data }) => {
        const record = deliveriesDb.get(where.id);
        if (!record) throw new Error('Not found');
        const updated = { ...record, ...data };
        deliveriesDb.set(where.id, updated);
        return updated;
      }),
    },
    donation_requests: {
      update: jest.fn(async () => ({})),
    },
    food_donations: {
      update: jest.fn(async () => ({})),
    },
    audit_logs: {
      create: jest.fn(async () => ({})),
    },
  },
  connectDatabase: jest.fn(async () => {}),
  disconnectDatabase: jest.fn(async () => {}),
}));

// Mock Socket.io broadcast to prevent transport connection triggers
jest.unstable_mockModule('../src/config/socket.js', () => ({
  __esModule: true,
  initSocketServer: jest.fn(() => ({})),
  getIO: jest.fn(() => ({})),
  broadcastToRoom: jest.fn(), // support both environments
}));

// Seed mock user (VOLUNTEER role)
const mockVolUser = {
  id: 'volunteer-user-uuid',
  full_name: 'John Walker',
  email: 'john@volunteer.org',
  role: 'VOLUNTEER',
  status: 'ACTIVE',
};
usersDb.set(mockVolUser.id, mockVolUser);

// Seed mock delivery
const mockDelivery = {
  id: 'delivery-uuid-1',
  donation_request_id: 'request-uuid',
  volunteer_id: null,
  delivery_status: 'ASSIGNED',
  donation_request: {
    id: 'request-uuid',
    donation_id: 'donation-uuid',
    donation: {
      id: 'donation-uuid',
      food_name: 'Rescued Bread',
      food_category: 'Bakery',
      pickup_latitude: 47.6062,
      pickup_longitude: -122.3321,
      expiry_time: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    },
    ngo: {
      organization_name: 'Seattle NGO',
      latitude: 47.6101,
      longitude: -122.3421,
    },
  },
};
deliveriesDb.set(mockDelivery.id, mockDelivery);

jest.unstable_mockModule('../src/repositories/auth.repository.js', () => ({
  __esModule: true,
  default: {
    findUserById: jest.fn(async (id) => usersDb.get(id) || null),
  },
}));

jest.unstable_mockModule('../src/repositories/volunteer.repository.js', () => ({
  __esModule: true,
  default: {
    findByUserId: jest.fn(async (userId) => {
      const record = Array.from(volunteersDb.values()).find((v) => v.user_id === userId);
      return record || null;
    }),
    findById: jest.fn(async (id) => volunteersDb.get(id) || null),
    upsert: jest.fn(async (userId, data) => {
      const existing = Array.from(volunteersDb.values()).find((v) => v.user_id === userId);
      const id = existing ? existing.id : `volunteer-profile-uuid-${Date.now()}`;
      const record = { id, user_id: userId, ...data };
      volunteersDb.set(id, record);
      return record;
    }),
    updateStatus: jest.fn(async (id, status) => {
      const record = volunteersDb.get(id);
      if (!record) throw new Error('Not found');
      const updated = { ...record, online_status: status, is_online: status === 'ONLINE' };
      volunteersDb.set(id, updated);
      return updated;
    }),
    updateLocation: jest.fn(async (id, lat, lng) => {
      const record = volunteersDb.get(id);
      if (!record) throw new Error('Not found');
      const updated = { ...record, current_latitude: lat, current_longitude: lng };
      volunteersDb.set(id, updated);
      return updated;
    }),
    getDashboardStats: jest.fn(async () => ({
      assigned: 0,
      pendingPickup: 1,
      inProgress: 0,
      completedToday: 0,
      completedMonth: 0,
      totalCompleted: 0,
      averageRating: 5.0,
    })),
    getMonthlyDeliveries: jest.fn(async () => []),
  },
}));

jest.unstable_mockModule('../src/repositories/delivery.repository.js', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(async (id) => deliveriesDb.get(id) || null),
    findAssignments: jest.fn(async () => Array.from(deliveriesDb.values())),
    findActiveDeliveries: jest.fn(async (volunteerId) => {
      return Array.from(deliveriesDb.values()).filter(
        (d) => d.volunteer_id === volunteerId && d.delivery_status !== 'DELIVERED'
      );
    }),
    acceptAssignment: jest.fn(async (id, volunteerId) => {
      const record = deliveriesDb.get(id);
      const updated = { ...record, volunteer_id: volunteerId, delivery_status: 'ACCEPTED' };
      deliveriesDb.set(id, updated);
      return updated;
    }),
    rejectAssignment: jest.fn(async (id) => {
      const record = deliveriesDb.get(id);
      const updated = { ...record, volunteer_id: null, delivery_status: 'ASSIGNED' };
      deliveriesDb.set(id, updated);
      return updated;
    }),
    savePickupProof: jest.fn(async (id, photo, lat, lng) => {
      const record = deliveriesDb.get(id);
      const updated = { ...record, pickup_photo: photo, pickup_latitude: lat, pickup_longitude: lng, delivery_status: 'PICKED_UP' };
      deliveriesDb.set(id, updated);
      return updated;
    }),
    saveDeliveryProof: jest.fn(async (id, photo, sig, notes, lat, lng) => {
      const record = deliveriesDb.get(id);
      const updated = { ...record, delivery_photo: photo, proof_signature: sig, delivery_notes: notes, delivery_latitude: lat, delivery_longitude: lng, delivery_status: 'DELIVERED' };
      deliveriesDb.set(id, updated);
      return updated;
    }),
    updateStatus: jest.fn(async (id, status) => {
      const record = deliveriesDb.get(id);
      const updated = { ...record, delivery_status: status };
      deliveriesDb.set(id, updated);
      return updated;
    }),
  },
}));

jest.unstable_mockModule('../src/repositories/tracking.repository.js', () => ({
  __esModule: true,
  default: {
    logLocation: jest.fn(async (volunteerId, lat, lng) => {
      const id = `log-uuid-${Date.now()}`;
      const record = { id, volunteer_id: volunteerId, latitude: lat, longitude: lng };
      logsDb.set(id, record);
      return record;
    }),
  },
}));

// Asynchronously load supertest and JWT components
const appModule = await import('../src/app.js');
const app = appModule.default;
const supertestModule = await import('supertest');
const request = supertestModule.default;
const jwtModule = await import('jsonwebtoken');
const jwt = jwtModule.default;
const jwtConfigModule = await import('../src/config/jwt.js');
const jwtConfig = jwtConfigModule.default;

describe('🚴 Volunteer Module API Integration Tests', () => {
  let volToken = '';

  beforeAll(() => {
    volToken = jwt.sign(
      { id: mockVolUser.id, email: mockVolUser.email, role: mockVolUser.role },
      jwtConfig.secret,
      { expiresIn: '1h' }
    );
  });

  it('1. Reject profile update if required fields are missing', async () => {
    const res = await request(app)
      .put('/api/volunteer/profile')
      .set('Authorization', `Bearer ${volToken}`)
      .send({ vehicle_type: 'UnknownVehicle' }); // Invalid enum

    expect(res.statusCode).toBe(400);
  });

  it('2. Complete Volunteer profile settings successfully', async () => {
    const res = await request(app)
      .put('/api/volunteer/profile')
      .set('Authorization', `Bearer ${volToken}`)
      .send({
        vehicle_type: 'Bike',
        vehicle_number: 'WA-8899-77',
        driving_license_number: 'DL-VOL-Seattle-44',
        phone: '+15550200',
        emergency_contact: '+15550299',
        operating_radius: 12.0,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicle_type).toBe('Bike');
  });

  it('3. Deny assignment acceptance if Volunteer is OFFLINE', async () => {
    const res = await request(app)
      .patch(`/api/assignments/${mockDelivery.id}/accept`)
      .set('Authorization', `Bearer ${volToken}`);

    expect(res.statusCode).toBe(403); // Forbidden: must be ONLINE
  });

  it('4. Successfully accept assignment when volunteer goes ONLINE', async () => {
    // Go ONLINE
    await request(app)
      .patch('/api/volunteer/status')
      .set('Authorization', `Bearer ${volToken}`)
      .send({ online_status: 'ONLINE' });

    const res = await request(app)
      .patch(`/api/assignments/${mockDelivery.id}/accept`)
      .set('Authorization', `Bearer ${volToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.delivery_status).toBe('ACCEPTED');
  });

  it('5. Successfully record food pickup proof coordinates and photos', async () => {
    // Transit to arrived
    await request(app)
      .patch(`/api/deliveries/${mockDelivery.id}/start`)
      .set('Authorization', `Bearer ${volToken}`);

    const res = await request(app)
      .patch(`/api/deliveries/${mockDelivery.id}/pickup`)
      .set('Authorization', `Bearer ${volToken}`)
      .send({
        latitude: 47.6062,
        longitude: -122.3321,
        photoUrl: 'https://cloudinary.com/pickups/proof123.jpg',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.delivery_status).toBe('PICKED_UP');
  });

  it('6. Log active coordinates telemetry locations', async () => {
    const res = await request(app)
      .post('/api/location/update')
      .set('Authorization', `Bearer ${volToken}`)
      .send({
        deliveryId: mockDelivery.id,
        latitude: 47.6080,
        longitude: -122.3350,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('7. Complete delivery with recipient signature and notes', async () => {
    // Start transit and arrive destination
    await request(app)
      .patch(`/api/deliveries/${mockDelivery.id}/start`)
      .set('Authorization', `Bearer ${volToken}`);

    await request(app)
      .patch(`/api/deliveries/${mockDelivery.id}/arrived`)
      .set('Authorization', `Bearer ${volToken}`);

    const res = await request(app)
      .patch(`/api/deliveries/${mockDelivery.id}/complete`)
      .set('Authorization', `Bearer ${volToken}`)
      .send({
        latitude: 47.6101,
        longitude: -122.3421,
        delivery_notes: 'Recipient was very friendly, items received in cold packs.',
        photoUrl: 'https://cloudinary.com/deliveries/proof123.jpg',
        signatureUrl: 'https://cloudinary.com/signatures/sig123.png',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.delivery_status).toBe('DELIVERED');
  });
});
