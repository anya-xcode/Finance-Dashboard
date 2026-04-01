// ============================================
// BaseRepository — Generic CRUD operations
// ============================================
// This is the Repository Pattern. It abstracts away
// all direct MongoDB/Mongoose calls so our Services
// never touch the database directly.
//
// Any model-specific repository extends this class
// and inherits all basic CRUD for free.

import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';

export class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  /** Create a new document */
  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return document.save();
  }

  /** Find one document by ID */
  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  /** Find one document matching a filter */
  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  /** Find all documents matching a filter */
  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  /** Find with pagination */
  async findPaginated(
    filter: FilterQuery<T>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<{ data: T[]; total: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return { data, total };
  }

  /** Update a document by ID */
  async updateById(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .exec();
  }

  /** Delete a document by ID (hard delete) */
  async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  /** Count documents matching a filter */
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  /** Run a MongoDB aggregation pipeline */
  async aggregate(pipeline: any[]): Promise<any[]> {
    return this.model.aggregate(pipeline).exec();
  }
}
