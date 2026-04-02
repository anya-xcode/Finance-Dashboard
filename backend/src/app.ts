// ============================================
// App — Express application setup
// ============================================
// Configures middleware, routes, and error handling.
// Separated from server.ts so the app can be tested independently.

import express from 'express';
import cors from 'cors';
import { authRoutes, userRoutes, recordRoutes, dashboardRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// ---- Global Middleware ----
app.use(cors());                    // Allow cross-origin requests (for React frontend)
app.use(express.json());            // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// ---- Health Check ----
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---- API Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ---- 404 Handler ----
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    data: null,
  });
});

// ---- Global Error Handler (must be last) ----
app.use(errorHandler);

export default app;
