// ============================================
// RecordFactory — Creates Financial Record objects
// ============================================

import { CreateRecordDTO } from '../types/interfaces';

export class RecordFactory {
  /** Create a record data object with defaults */
  static create(dto: CreateRecordDTO, createdBy: string) {
    return {
      amount: dto.amount,
      type: dto.type,
      category: dto.category,
      date: new Date(dto.date),
      description: dto.description?.trim() || '',
      createdBy,
      isDeleted: false,
    };
  }
}
