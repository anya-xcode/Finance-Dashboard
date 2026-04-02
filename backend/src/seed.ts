// ============================================
// Seed Script — Populates the database with sample data
// ============================================
// Run with: npm run seed
// Creates 3 users (admin, analyst, viewer) and 15 sample records.

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { Database } from './database';
import { UserModel } from './models/User';
import { RecordModel } from './models/Record';
import { UserRole, RecordType, RecordCategory } from './types/enums';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-dashboard';

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: UserRole.ADMIN,
  },
  {
    name: 'Analyst User',
    email: 'analyst@example.com',
    password: 'analyst123',
    role: UserRole.ANALYST,
  },
  {
    name: 'Viewer User',
    email: 'viewer@example.com',
    password: 'viewer123',
    role: UserRole.VIEWER,
  },
];

const sampleRecords = [
  { amount: 5000, type: RecordType.INCOME, category: RecordCategory.SALARY, date: '2026-01-15', description: 'January salary' },
  { amount: 1200, type: RecordType.EXPENSE, category: RecordCategory.RENT, date: '2026-01-05', description: 'Monthly rent' },
  { amount: 350, type: RecordType.EXPENSE, category: RecordCategory.FOOD, date: '2026-01-10', description: 'Groceries' },
  { amount: 800, type: RecordType.INCOME, category: RecordCategory.FREELANCE, date: '2026-01-20', description: 'Freelance project' },
  { amount: 150, type: RecordType.EXPENSE, category: RecordCategory.TRANSPORT, date: '2026-01-18', description: 'Fuel and metro' },
  { amount: 5000, type: RecordType.INCOME, category: RecordCategory.SALARY, date: '2026-02-15', description: 'February salary' },
  { amount: 1200, type: RecordType.EXPENSE, category: RecordCategory.RENT, date: '2026-02-05', description: 'Monthly rent' },
  { amount: 200, type: RecordType.EXPENSE, category: RecordCategory.UTILITIES, date: '2026-02-08', description: 'Electricity bill' },
  { amount: 500, type: RecordType.EXPENSE, category: RecordCategory.ENTERTAINMENT, date: '2026-02-14', description: 'Valentine dinner' },
  { amount: 2000, type: RecordType.INCOME, category: RecordCategory.INVESTMENT, date: '2026-02-25', description: 'Stock dividends' },
  { amount: 5000, type: RecordType.INCOME, category: RecordCategory.SALARY, date: '2026-03-15', description: 'March salary' },
  { amount: 1200, type: RecordType.EXPENSE, category: RecordCategory.RENT, date: '2026-03-05', description: 'Monthly rent' },
  { amount: 300, type: RecordType.EXPENSE, category: RecordCategory.HEALTHCARE, date: '2026-03-12', description: 'Doctor visit' },
  { amount: 1500, type: RecordType.INCOME, category: RecordCategory.FREELANCE, date: '2026-03-22', description: 'Web design gig' },
  { amount: 450, type: RecordType.EXPENSE, category: RecordCategory.SHOPPING, date: '2026-03-28', description: 'New clothes' },
];

async function seed() {
  try {
    // Connect to database
    const db = Database.getInstance();
    await db.connect(MONGODB_URI);

    // Clear existing data
    await UserModel.deleteMany({});
    await RecordModel.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users with hashed passwords
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await UserModel.create({
        ...userData,
        password: hashedPassword,
        isActive: true,
      });
      createdUsers.push(user);
      console.log(`👤 Created user: ${user.email} (${user.role})`);
    }

    // Create records (all created by admin)
    const adminUser = createdUsers[0];
    for (const recordData of sampleRecords) {
      await RecordModel.create({
        ...recordData,
        date: new Date(recordData.date),
        createdBy: adminUser._id,
        isDeleted: false,
      });
    }
    console.log(`📊 Created ${sampleRecords.length} sample records`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   Admin:   admin@example.com   / admin123');
    console.log('   Analyst: analyst@example.com / analyst123');
    console.log('   Viewer:  viewer@example.com  / viewer123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
