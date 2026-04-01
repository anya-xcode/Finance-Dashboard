// ============================================
// Database — Singleton MongoDB connection
// ============================================
// Uses the Singleton pattern to ensure only one
// database connection exists throughout the app.

import mongoose from 'mongoose';

export class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  // Private constructor prevents direct instantiation
  private constructor() {}

  /** Get the single Database instance */
  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /** Connect to MongoDB */
  async connect(uri: string): Promise<void> {
    if (this.isConnected) {
      console.log('⚡ Already connected to MongoDB');
      return;
    }

    try {
      await mongoose.connect(uri);
      this.isConnected = true;
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      process.exit(1);
    }
  }

  /** Disconnect from MongoDB */
  async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    await mongoose.disconnect();
    this.isConnected = false;
    console.log('🔌 Disconnected from MongoDB');
  }
}
