// ============================================
// RecordService — Financial records business logic
// ============================================
// CRUD + filtering for income/expense records.

import { RecordRepository } from '../repositories';
import { RecordFactory } from '../factories/RecordFactory';
import { CreateRecordDTO, RecordFilters, PaginatedResult } from '../types/interfaces';
import { ApiError } from '../utils/ApiError';
import { PAGINATION } from '../utils/constants';

export class RecordService {
  private recordRepo: RecordRepository;

  constructor() {
    this.recordRepo = new RecordRepository();
  }

  /** Create a new financial record */
  async createRecord(dto: CreateRecordDTO, userId: string) {
    const recordData = RecordFactory.create(dto, userId);
    const record = await this.recordRepo.create(recordData as any);
    return record;
  }

  /** Get records with filtering and pagination */
  async getRecords(filters: RecordFilters): Promise<PaginatedResult<any>> {
    const page = filters.page || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(filters.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

    const { data, total } = await this.recordRepo.findFiltered(filters);

    const formattedData = data.map((record: any) => ({
      ...record.toObject ? record.toObject() : record,
      id: record._id.toString(),
    }));

    return {
      data: formattedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** Get a single record by ID */
  async getRecordById(id: string) {
    const record = await this.recordRepo.findById(id);
    if (!record || record.isDeleted) {
      throw ApiError.notFound('Record not found');
    }
    return {
      ...record.toObject ? record.toObject() : record,
      id: record._id.toString(),
    };
  }

  /** Update a record */
  async updateRecord(id: string, updates: Partial<CreateRecordDTO>) {
    const record = await this.recordRepo.findById(id);
    if (!record || record.isDeleted) {
      throw ApiError.notFound('Record not found');
    }

    // Build update object (only include provided fields)
    const updateData: any = {};
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.type) updateData.type = updates.type;
    if (updates.category) updateData.category = updates.category;
    if (updates.date) updateData.date = new Date(updates.date);
    if (updates.description !== undefined) updateData.description = updates.description;

    const updated = await this.recordRepo.updateById(id, updateData);
    if (!updated) return null;

    return {
      ...updated.toObject ? updated.toObject() : updated,
      id: updated._id.toString(),
    };
  }

  /** Soft delete a record */
  async deleteRecord(id: string) {
    const record = await this.recordRepo.findById(id);
    if (!record || record.isDeleted) {
      throw ApiError.notFound('Record not found');
    }

    await this.recordRepo.softDelete(id);
    return { message: 'Record deleted successfully' };
  }
}
