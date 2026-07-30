import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import errorHandler from './middlewares/errorHandler.js';
import { sendSuccess, sendError } from './utils/responseHelper.js';
import authRoutes from './routes/auth.routes.js';
import carRoutes from './routes/car.routes.js';
import leadRoutes from './routes/lead.routes.js';
import testDriveRoutes from './routes/testDrive.routes.js';
import serviceBookingRoutes from './routes/serviceBooking.routes.js';
import jobCardRoutes from './routes/jobCard.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';

// Load environment variables
dotenv.config();

const app = express();

// Security HTTP headers
app.use(helmet());

// Configure CORS
const corsOptions = {
  origin: '*', // We can restrict this to the frontend domain later (e.g. process.env.FRONTEND_URL)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Request logging in dev environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Parsing JSON body
app.use(express.json());

// Parsing URL-encoded body
app.use(express.urlencoded({ extended: true }));

// Parsing cookies
app.use(cookieParser());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/test-drives', testDriveRoutes);
app.use('/api/service-bookings', serviceBookingRoutes);
app.use('/api/job-cards', jobCardRoutes);
app.use('/api/inventory', inventoryRoutes);

// Base health check route
app.get('/health', (req, res) => {
  return sendSuccess(res, 200, 'Server is running healthy');
});

// Root fallback route
app.get('/', (req, res) => {
  return sendSuccess(res, 200, 'Welcome to the SpeedMotors API Gateway. Service is online.');
});

// Fallback for undefined routes (404 Error)
app.use('*', (req, res) => {
  return sendError(res, 404, `Endpoint ${req.originalUrl} not found`);
});

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
