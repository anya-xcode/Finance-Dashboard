// ============================================
// Server — Application entry point
// ============================================
// Connects to MongoDB and starts the Express server.

import dotenv from 'dotenv';
dotenv.config(); // Load .env before anything else

import app from './app';
import { Database } from './database';

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-dashboard';

async function startServer() {
  try {
    // Connect to MongoDB (Singleton)
    const db = Database.getInstance();
    await db.connect(MONGODB_URI);

    // Start Express
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API docs: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
