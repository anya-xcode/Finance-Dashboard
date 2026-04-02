// ============================================
// DashboardService — Analytics & summary logic
// ============================================
// Aggregates financial data for dashboard display.

import { RecordRepository } from '../repositories';
import { DashboardSummary, CategoryTotal, MonthlyTrend } from '../types/interfaces';

export class DashboardService {
  private recordRepo: RecordRepository;

  constructor() {
    this.recordRepo = new RecordRepository();
  }

  /** Get overall summary: total income, expenses, net balance */
  async getSummary(): Promise<DashboardSummary> {
    const totals = await this.recordRepo.getSummaryTotals();

    let totalIncome = 0;
    let totalExpenses = 0;
    let recordCount = 0;

    for (const item of totals) {
      if (item._id === 'income') {
        totalIncome = item.total;
      } else if (item._id === 'expense') {
        totalExpenses = item.total;
      }
      recordCount += item.count;
    }

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      recordCount,
    };
  }

  /** Get totals grouped by category */
  async getCategoryTotals(): Promise<CategoryTotal[]> {
    const results = await this.recordRepo.getCategoryTotals();

    return results.map((item) => ({
      category: item._id,
      total: item.total,
      count: item.count,
    }));
  }

  /** Get monthly income vs expense trends */
  async getMonthlyTrends(): Promise<MonthlyTrend[]> {
    const results = await this.recordRepo.getMonthlyTrends();

    // Group raw results by month
    const monthMap = new Map<string, MonthlyTrend>();

    for (const item of results) {
      const month = item._id.month;
      if (!monthMap.has(month)) {
        monthMap.set(month, { month, income: 0, expense: 0 });
      }

      const entry = monthMap.get(month)!;
      if (item._id.type === 'income') {
        entry.income = item.total;
      } else {
        entry.expense = item.total;
      }
    }

    // Convert to sorted array
    return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }

  /** Get most recent activity */
  async getRecentActivity(limit: number = 10) {
    const results = await this.recordRepo.getRecentRecords(limit);
    return results.map((record: any) => ({
      ...record.toObject ? record.toObject() : record,
      id: record._id.toString(),
    }));
  }
}
