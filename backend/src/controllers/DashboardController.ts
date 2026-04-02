// ============================================
// DashboardController — Handles dashboard analytics requests
// ============================================

import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/DashboardService';
import { ApiResponse } from '../utils/ApiResponse';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  /** GET /api/dashboard/summary */
  getSummary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.dashboardService.getSummary();
      res.status(200).json(ApiResponse.success(summary));
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/dashboard/category-totals */
  getCategoryTotals = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const totals = await this.dashboardService.getCategoryTotals();
      res.status(200).json(ApiResponse.success(totals));
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/dashboard/monthly-trends */
  getMonthlyTrends = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const trends = await this.dashboardService.getMonthlyTrends();
      res.status(200).json(ApiResponse.success(trends));
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/dashboard/recent-activity */
  getRecentActivity = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const activity = await this.dashboardService.getRecentActivity();
      res.status(200).json(ApiResponse.success(activity));
    } catch (error) {
      next(error);
    }
  };
}
