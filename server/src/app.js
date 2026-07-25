import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import logger from './utils/logger.js';
import env from './config/env.js';
import { notFoundMiddleware } from './middlewares/notFound.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { HTTP_STATUS } from './utils/httpStatus.js';
import authRoutes from './routes/auth.routes.js';
import donationRoutes from './routes/donation.routes.js';
import ngoRoutes from './routes/ngo.routes.js';
import requestRoutes from './routes/request.routes.js';
import volunteerRoutes from './routes/volunteer.routes.js';
import deliveryRoutes from './routes/delivery.routes.js';
import trackingRoutes from './routes/tracking.routes.js';
import adminRoutes from './routes/admin.routes.js';
import searchRoutes from './routes/search.routes.js';
import healthRoutes from './routes/health.routes.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

const swaggerDocument = JSON.parse(
  fs.readFileSync(new URL('./docs/swagger.json', import.meta.url))
);

const app = express();

// Secure Express apps by setting various HTTP headers
app.use(helmet());

// Compress response bodies for all request
app.use(compression());

// Enable Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

// Parse incoming request bodies in JSON format
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create stream for morgan that writes messages using Winston http level
const winstonStream = {
  write: (message) => logger.log('http', message.trim()),
};

// Configure Morgan request logger middleware
app.use(
  morgan(':remote-addr - :method :url :status :res[content-length] - :response-time ms', {
    stream: winstonStream,
  })
);

// Static uploads folder routing
app.use('/uploads', express.static('uploads'));

// Mount Authentication Routes
app.use('/api/auth', authRoutes);

// Mount Donation Routes
app.use('/api/donations', donationRoutes);

// Mount NGO Profile & Verification Routes
app.use('/api/ngo', ngoRoutes);

// Mount Food Request/Claim Routes
app.use('/api/requests', requestRoutes);

// Mount Volunteer Profile Settings
app.use('/api/volunteer', volunteerRoutes);

// Mount Delivery Assignments
app.use('/api', deliveryRoutes);

// Mount Location Tracking logs
app.use('/api/location', trackingRoutes);

// Mount Platform Administration
app.use('/api/admin', adminRoutes);

// Mount Global Search
app.use('/api/search', searchRoutes);

// Mount Health & Metrics endpoints
app.use('/api', healthRoutes);

// Serves static Swagger documentation UI page
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Unhandled route handler (404)
app.use(notFoundMiddleware);

// Global centralized error middleware
app.use(errorMiddleware);

export default app;
