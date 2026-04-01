// ============================================
// RecordRepository — Data access for Financial Records
// ============================================

import { FilterQuery } from 'mongoose';
import { BaseRepository } from './BaseRepository';
import { RecordModel, IRecordDocument } from '../models';
import { RecordFilters } from '../types/interfaces';
import { PAGINATION } from '../utils/constants';

export class RecordRepository extends BaseRepository<IRecordDocument> {
  constructor() {
    super(RecordModel);
  }

  /** Build a MongoDB filter from user-provided query params */
  private buildFilter(filters: RecordFilters): FilterQuery<IRecordDocument> {
    const query: FilterQuery<IRecordDocument> = { isDeleted: false };

    if (filters.type) query.type = filters.type;
    if (filters.category) query.category = filters.category;

    // Date range filtering
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = new Date(filters.startDate);
      if (filters.endDate) query.date.$lte = new Date(filters.endDate);
    }

    return query;
  }

  /** Get paginated & filtered records */
  async findFiltered(filters: RecordFilters) {
    const query = this.buildFilter(filters);
    const page = filters.page || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(filters.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

    return this.findPaginated(query, page, limit, { date: -1 });
  }

  /** Soft delete — mark as deleted instead of removing */
  async softDelete(id: string): Promise<IRecordDocument | null> {
    return this.updateById(id, { isDeleted: true });
  }

  /** Get income/expense totals using aggregation */
  async getSummaryTotals(): Promise<{ _id: string; total: number; count: number }[]> {
    return this.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);
  }

  /** Get totals grouped by category */
  async getCategoryTotals(): Promise<{ _id: string; total: number; count: number }[]> {
    return this.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);
  }

  /** Get monthly income & expense trends */
  async getMonthlyTrends(): Promise<any[]> {
    return this.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$date' } },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);
  }

  /** Get most recent records */
  async getRecentRecords(limit: number = 10): Promise<IRecordDocument[]> {
    return this.model
      .find({ isDeleted: false })
      .sort({ date: -1 })
      .limit(limit)
      .populate('createdBy', 'name email')
      .exec();
  }
}
