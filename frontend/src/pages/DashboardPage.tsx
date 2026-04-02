import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, TrendingDown, IndianRupee, Activity, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass, glowClass, delay, prefix = "₹" }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -5, scale: 1.02 }}
    className={`glass-card p-6 relative overflow-hidden group`}
  >
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${glowClass}`} />
    <div className="relative z-10 flex items-center gap-4">
      <div className={`p-4 rounded-2xl ${colorClass}/10 text-${colorClass.split('-')[1]}-400 border border-${colorClass.split('-')[1]}-500/20`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
        <h3 className="text-3xl font-black tracking-tighter">
          {prefix}{value?.toLocaleString()}
        </h3>
      </div>
    </div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 shadow-2xl border-white/10">
        <p className="text-xs font-black text-secondary mb-3 uppercase tracking-widest border-b border-white/5 pb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-6 py-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">{entry.name}</p>
            </div>
            <p className="text-sm font-black tracking-tight text-white">
              ₹{entry.value.toLocaleString()}
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

  const userRole = user?.role?.toLowerCase();
  const canSeeAnalytics = userRole === 'admin' || userRole === 'analyst';

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
        setError('Failed to sync financial data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [canSeeAnalytics]);

  if (loading) return (
    <div className="container flex flex-col items-center justify-center p-24 gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-indigo-500/20 rounded-full" />
        <div className="absolute inset-0 w-16 h-16 border-t-2 border-indigo-500 rounded-full animate-spin" />
      </div>
      <p className="text-secondary font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing Secure Stream</p>
    </div>
  );

  return (
    <div className="container space-y-12 pb-12">
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex gap-1">
              {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-emerald-500/40 rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
            </div>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Operational Status: Live</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-2">Command Center</h1>
          <p className="text-secondary font-medium">Strategic financial intelligence for <span className="text-white font-bold">{user?.name}</span></p>
        </div>
      </header>

      {error && (
        <div className="glass-card p-6 flex items-center gap-4 text-rose-400 border-rose-500/20 bg-rose-500/5">
          <AlertCircle size={24} /> 
          <div>
            <p className="font-black uppercase tracking-widest text-xs">Sync Interrupted</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {canSeeAnalytics && summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Liquidity" value={summary.totalIncome} icon={TrendingUp} colorClass="bg-emerald-500" glowClass="glow-emerald" delay={0.1} />
          <StatCard title="Total Liabilities" value={summary.totalExpenses} icon={TrendingDown} colorClass="bg-rose-500" glowClass="glow-rose" delay={0.2} />
          <StatCard title="Net Capital" value={summary.netBalance} icon={IndianRupee} colorClass="bg-indigo-500" glowClass="glow-indigo" delay={0.3} />
          <StatCard title="Audit Count" value={summary.recordCount} icon={Activity} colorClass="bg-amber-500" glowClass="glow-amber" prefix="" delay={0.4} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Trends Chart */}
        {canSeeAnalytics && monthlyTrends.length > 0 && (
          <div className="glass-card p-10 lg:col-span-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 via-indigo-500/50 to-rose-500/50" />
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-black tracking-tighter uppercase">Performance Stream</h3>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-1">Temporal Cashflow Analysis</p>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" /> 
                  <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Inflow</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]" /> 
                  <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Outflow</span>
                </div>
              </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <defs>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dx={-10} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="income" name="Inflow" stroke="#10b981" strokeWidth={3} fill="url(#colorInc)" animationDuration={1500} />
                  <Area type="monotone" dataKey="expense" name="Outflow" stroke="#f43f5e" strokeWidth={3} fill="url(#colorExp)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {canSeeAnalytics && categoryTotals.length > 0 && (
          <div className="glass-card p-10 flex flex-col items-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <Activity size={80} />
             </div>
            <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">Allocation</h3>
            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mb-10">Sector distribution</p>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={categoryTotals} 
                    cx="50%" cy="50%" 
                    innerRadius={80} 
                    outerRadius={120} 
                    paddingAngle={8} 
                    dataKey="total" 
                    nameKey="category"
                    stroke="none"
                  >
                    {categoryTotals.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'][index % 6]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              {categoryTotals.slice(0, 4).map((cat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: ['#6366f1', '#a855f7', '#ec4899', '#f59e0b'][i % 4] }} />
                  <span className="text-[10px] font-black text-secondary uppercase truncate">{cat.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Feed */}
      <div className="glass-card p-10 relative overflow-hidden">
        <div className="flex justify-between items-center mb-10">
           <div>
            <h3 className="text-2xl font-black tracking-tighter uppercase">Security Stream</h3>
            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-1">Latest cryptospheric activity</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest cursor-pointer">
            Historical Archive
          </motion.div>
        </div>

        <div className="space-y-4">
          {recentActivity.slice(0, 8).map((record, index) => (
            <motion.div 
              key={record.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition group"
            >
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs ${
                  record.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {new Date(record.date).getDate()}
                  <span className="text-[8px] opacity-60 ml-0.5 uppercase">{new Date(record.date).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black tracking-tight">{record.description || 'Genesis Transaction'}</span>
                    <span className="badge badge-outline text-[8px] opacity-70">{record.category}</span>
                  </div>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Hash: {record.id.slice(0, 12)}...</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-black tracking-tighter ${record.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {record.type === 'income' ? '+' : '-'} ₹{record.amount.toLocaleString()}
                </p>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Verified</p>
              </div>
            </motion.div>
          ))}
          {recentActivity.length === 0 && (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="text-secondary opacity-20" size={32} />
              </div>
              <p className="text-secondary font-black uppercase tracking-[0.3em] text-[10px]">Zero Sequence Detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
