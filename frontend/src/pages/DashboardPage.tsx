import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, prefix = "$" }: any) => (
  <div className="glass-card p-6 flex items-center gap-6">
    <div className={`p-4 rounded-xl ${color} bg-opacity-20`}>
      <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
    <div>
      <p className="text-secondary text-sm font-medium uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold mt-1">{prefix}{value?.toLocaleString()}</h3>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [categoryTotals, setCategoryTotals] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canSeeAnalytics = user?.role === 'admin' || user?.role === 'analyst';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, catRes, trendRes, actRes] = await Promise.all([
          canSeeAnalytics ? api.get('/dashboard/summary') : Promise.resolve({ data: { data: null } }),
          canSeeAnalytics ? api.get('/dashboard/category-totals') : Promise.resolve({ data: { data: [] } }),
          canSeeAnalytics ? api.get('/dashboard/monthly-trends') : Promise.resolve({ data: { data: [] } }),
          api.get('/dashboard/recent-activity')
        ]);

        setSummary(sumRes.data.data);
        setCategoryTotals(catRes.data.data);
        setMonthlyTrends(trendRes.data.data);
        setRecentActivity(actRes.data.data);
      } catch (err: any) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [canSeeAnalytics]);

  if (loading) return <div className="container p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
        <p className="text-secondary">Track your income and expenses at a glance.</p>
      </div>

      {error && (
        <div className="glass-card p-4 border-red-500/20 bg-red-500/5 flex items-center gap-3 text-red-500">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Summary Cards */}
      {canSeeAnalytics && summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Income" value={summary.totalIncome} icon={TrendingUp} color="bg-emerald-500" />
          <StatCard title="Total Expenses" value={summary.totalExpenses} icon={TrendingDown} color="bg-rose-500" />
          <StatCard title="Net Balance" value={summary.netBalance} icon={DollarSign} color="bg-indigo-500" />
          <StatCard title="Transactions" value={summary.recordCount} icon={Activity} color="bg-purple-500" prefix="" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trends Chart */}
        {canSeeAnalytics && monthlyTrends.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-6">Income vs Expenses</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <defs>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" />
                  <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Category Breakdown (Donut Chart) */}
        {canSeeAnalytics && categoryTotals.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-6">Expense Categories</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryTotals}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="category"
                  >
                    {categoryTotals.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={[
                        '#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'
                      ][index % 6]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Table */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-secondary text-sm">
                <th className="pb-4 font-medium">Date</th>
                <th className="pb-4 font-medium">Category</th>
                <th className="pb-4 font-medium">Description</th>
                <th className="pb-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentActivity.map((record) => (
                <tr key={record._id} className="group hover:bg-white/5 transition">
                  <td className="py-4 text-sm font-medium">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <span className="px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase">
                      {record.category}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-secondary group-hover:text-white transition">
                    {record.description}
                  </td>
                  <td className={`py-4 text-sm font-bold text-right ${
                    record.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {record.type === 'income' ? '+' : '-'} {record.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {recentActivity.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-secondary">
                    No recent activity found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
