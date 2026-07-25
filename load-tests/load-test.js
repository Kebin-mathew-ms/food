import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 virtual users
    { duration: '1m', target: 50 },  // Load spike to 50 virtual users
    { duration: '30s', target: 0 },  // Cool down shutdown
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of request latency must be below 500ms
  },
};

const BASE_URL = 'http://localhost:5000/api';

export default function () {
  // 1. Load basic application health status page
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'database services UP': (r) => r.json().services.database === 'UP',
  });

  sleep(1);

  // 2. Perform system metrics log requests query
  const metricsRes = http.get(`${BASE_URL}/metrics`);
  check(metricsRes, {
    'metrics stats status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // 3. Simulated authorization login payload submission
  const loginPayload = JSON.stringify({
    email: 'donor@example.com',
    password: 'securePassword123',
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, params);
  check(loginRes, {
    'login submission completes': (r) => r.status === 200 || r.status === 400 || r.status === 401,
  });

  sleep(2);
}
