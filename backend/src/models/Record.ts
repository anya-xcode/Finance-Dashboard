// ============================================
// Record Model — Financial record (income/expense)
// ============================================

import mongoose, { Schema, Document } from 'mongoose';
import { RecordType, RecordCategory } from '../types/enums';

/** Mongoose document interface for Record */
export interface IRecordDocument extends Document {
  amount: number;
  type: RecordType;
  category: string;
  date: Date;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Mongoose schema definition */
const RecordSchema = new Schema<IRecordDocument>(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: Object.values(RecordType),
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: Object.values(RecordCategory),
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false, // Soft delete — records are never truly removed
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries on common filter fields
RecordSchema.index({ type: 1, category: 1, date: -1 });
RecordSchema.index({ isDeleted: 1 });

export const RecordModel = mongoose.model<IRecordDocument>('Record', RecordSchema);
