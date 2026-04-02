// ============================================
// RecordController — Handles financial record HTTP requests
// ============================================

import { Request, Response, NextFunction } from 'express';
import { RecordService } from '../services/RecordService';
import { ApiResponse } from '../utils/ApiResponse';

export class RecordController {
  private recordService: RecordService;

  constructor() {
    this.recordService = new RecordService();
  }

  /** POST /api/records */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const record = await this.recordService.createRecord(req.body, req.user!.userId);
      res.status(201).json(ApiResponse.success(record, 'Record created successfully'));
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/records */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        type: req.query.type as any,
        category: req.query.category as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await this.recordService.getRecords(filters);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/records/:id */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const record = await this.recordService.getRecordById(req.params.id as string);
      res.status(200).json(ApiResponse.success(record));
    } catch (error) {
      next(error);
    }
  };

  /** PATCH /api/records/:id */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      console.log(`[RecordController] Updating record ${id}`, req.body);
      const record = await this.recordService.updateRecord(id, req.body);
      res.status(200).json(ApiResponse.success(record, 'Record updated successfully'));
    } catch (error) {
      console.error(`[RecordController] Update failed for ${req.params.id}:`, error);
      next(error);
    }
  };

  /** DELETE /api/records/:id */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.recordService.deleteRecord(req.params.id as string);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };
}
