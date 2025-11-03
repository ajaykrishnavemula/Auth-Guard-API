import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import passport from './config/passport';
import 'express-async-errors';

// Import routes
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';

// Import middleware
import notFoundMiddleware from './middleware/not-found';
import errorHandlerMiddleware from './middleware/error-handler';
import { apiLogger, securityMonitor, sessionActivity } from './middleware/audit';

// Import config
import config from './config';
import { logger, loggerMiddleware } from './utils/logger';

// Create Express app
const app: Express = express();

// Set security HTTP headers
app.use(helmet());

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// Sanitize request data
app.use(xss());
app.use(mongoSanitize());

// Enable CORS
app.use(cors());

// Enable compression
app.use(compression());

// Parse cookies
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());

// Use logger middleware
app.use(loggerMiddleware);

// Use audit and security middleware
app.use(apiLogger);
app.use(securityMonitor);
app.use(sessionActivity);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    environment: config.environment,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);

// Handle 404 errors
app.use(notFoundMiddleware);

// Handle errors
app.use(errorHandlerMiddleware);

export default app;

