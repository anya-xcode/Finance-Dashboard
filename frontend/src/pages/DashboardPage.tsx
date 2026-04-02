import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, TrendingDown, IndianRupee, Activity, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass, delay, prefix = "₹" }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -5 }}
    className="glass-card p-6 relative"
  >
    <div className="flex items-center gap-4">
      <div className={`p-4 rounded-2xl ${colorClass}`} style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-secondary text-xs font-bold uppercase tracking-widest mb-1 opacity-70">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-black tracking-tighter">
            {prefix}{value?.toLocaleString()}
          </h3>
        </div>
      </div>
    </div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 shadow-2xl">
        <p className="text-xs font-bold text-secondary mb-2 uppercase tracking-widest">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 py-1">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <p className="text-sm font-bold">
              {entry.name}: <span style={{ color: '#818cf8' }}>₹{entry.value.toLocaleString()}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [categoryTotals, setCategoryTotals] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const role = user?.role?.toLowerCase();
  const canSeeAnalytics = role === 'admin' || role === 'analyst' || role === 'viewer';
  
  useEffect(() => {
    console.log(`[DashboardPage] Analytics Visibility Check:`, { role, canSeeAnalytics });
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
        setError('Failed to sync financial data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [canSeeAnalytics]);

  if (loading) return (
    <div className="container flex flex-col items-center justify-center p-12 gap-4">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-secondary font-bold">Syncing secure data...</p>
    </div>
  );

  return (
    <div className="container space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Live System Status</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Market Overview</h1>
          <p className="text-secondary">Financial analytics for <span className="text-white">{user?.name}</span></p>
        </div>
      </header>

      {error && (
        <div className="glass-card p-4 flex items-center gap-3 text-rose-500 font-bold" style={{ borderColor: 'rgba(244, 63, 94, 0.2)' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Summary Cards */}
      {canSeeAnalytics && summary && (
        <div className="grid grid-cols-4 gap-6">
          <StatCard title="Liquidity" value={summary.totalIncome} icon={TrendingUp} colorClass="bg-emerald-500" delay={0.1} />
          <StatCard title="Liabilities" value={summary.totalExpenses} icon={TrendingDown} colorClass="bg-rose-500" delay={0.2} />
          <StatCard title="Net Capital" value={summary.netBalance} icon={IndianRupee} colorClass="bg-indigo-500" delay={0.3} />
          <StatCard title="Activity Log" value={summary.recordCount} icon={Activity} colorClass="bg-amber-500" prefix="" delay={0.4} />
        </div>
      )}

      <div className="grid grid-cols-3 gap-8">
        {/* Monthly Trends Chart */}
        {canSeeAnalytics && monthlyTrends.length > 0 && (
          <div className="glass-card p-8" style={{ gridColumn: 'span 2' }}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black tracking-tight">Performance Stream</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400" /> <span className="text-xs font-bold text-secondary uppercase">Income</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-400" /> <span className="text-xs font-bold text-secondary uppercase">Expense</span></div>
              </div>
            </div>
            <div style={{ height: '350px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <defs>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#colorInc)" />
                  <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {canSeeAnalytics && categoryTotals.length > 0 && (
          <div className="glass-card p-8">
            <h3 className="text-xl font-black tracking-tight mb-8 text-center uppercase tracking-widest">Allocation</h3>
            <div style={{ height: '350px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryTotals} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="total" nameKey="category">
                    {categoryTotals.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'][index % 6]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-8 overflow-hidden">
        <h3 className="text-2xl font-black tracking-tighter mb-8">Security Log</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-secondary text-xs uppercase font-bold tracking-widest">
              <th className="pb-6">Timestamp</th>
              <th className="pb-6">Class</th>
              <th className="pb-6">Identity Header</th>
              <th className="pb-6 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {recentActivity.map((record) => (
              <tr key={record.id} className="hover:bg-white/5 transition">
                <td className="py-5 text-xs font-mono text-secondary">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="py-5">
                  <span className="badge badge-success text-xs" style={{ fontSize: '10px' }}>{record.category}</span>
                </td>
                <td className="py-5 text-sm font-bold">
                  {record.description}
                </td>
                <td className={`py-5 text-sm font-black text-right ${record.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {record.type === 'income' ? '+' : '-'} ₹{record.amount.toLocaleString()}
                </td>
              </tr>
            ))}
            {recentActivity.length === 0 && (
              <tr>
                <td colSpan={4} className="py-20 text-center text-secondary font-bold uppercase text-xs tracking-widest">
                  No active transaction streams detected.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;
