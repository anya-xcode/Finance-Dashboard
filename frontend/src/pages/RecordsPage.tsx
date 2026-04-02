import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Download, Search, Loader2 } from 'lucide-react';

const RecordsPage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ type: '', category: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const q = new URLSearchParams(activeFilters).toString();
      const res = await api.get(`/records?${q}`);
      const data = res.data.data.data;
      if (data && data.length > 0) {
        console.log('[RecordsPage] First record ID check:', { 
          id: data[0].id, 
          _id: data[0]._id,
          hasId: !!data[0].id,
          has_Id: !!data[0]._id
        });
      }
      setRecords(data);
    } catch (err: any) {
      console.error('Fetch records failed:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submissionData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      console.log(`[RecordsPage] Submission Attempt:`, { editingId, submissionData });

      if (editingId) {
        await api.patch(`/records/${editingId}`, submissionData);
      } else {
        await api.post('/records', submissionData);
      }
      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchRecords();
    } catch (err: any) {
      console.error('Operation failed:', err.response?.data || err);
      const msg = err.response?.data?.message || 'Operation failed';
      const errors = err.response?.data?.data;
      if (errors && Array.isArray(errors)) {
        alert(`${msg}: ${errors.map(e => e.message).join(', ')}`);
      } else {
        alert(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    console.log(`[RecordsPage] Delete Attempt: ${id}`);
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/records/${id}`);
      fetchRecords();
    } catch (err: any) {
      console.error('Delete failed:', err.response?.data || err);
      alert(`Delete failed: ${err.response?.data?.message || 'Access Denied'}`);
    }
  };

  const startEdit = (record: any) => {
    setEditingId(record.id);
    setFormData({
      amount: record.amount.toString(),
      type: record.type,
      category: record.category,
      date: new Date(record.date).toISOString().split('T')[0],
      description: record.description
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      type: 'expense',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setEditingId(null);
  };

  const handleExportCSV = () => {
    if (records.length === 0) return alert('No records to export');
    
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = records.map(r => [
      new Date(r.date).toLocaleDateString(),
      r.type.toUpperCase(),
      r.category,
      r.description.replace(/,/g, ';'), // Prevent CSV breaking
      r.amount
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `finance_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Financial Ledger</h1>
          <p className="text-secondary">Detailed audit trail of all transactions.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleExportCSV}
            className="btn-outline flex items-center gap-2"
          >
            <Download size={18} /> Export CSV
          </button>
          {isAdmin && (
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { resetForm(); setShowModal(true); }} 
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} /> New Record
            </motion.button>
          )}
        </div>
      </header>

      {/* Filter Bar */}
      <div className="glass-card p-2 flex gap-2 items-center">
        <div className="relative flex-1" style={{ position: 'relative', flex: 1 }}>
          <Search className="absolute text-secondary" size={18} style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="w-full"
            style={{ backgroundColor: 'transparent', border: 'none', paddingLeft: '48px' }}
          />
        </div>
        <div style={{ height: '32px', width: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />
        <div className="flex items-center gap-4 px-4">
          <select 
            className="text-sm font-bold text-white cursor-pointer"
            style={{ backgroundColor: 'transparent', border: 'none', width: 'auto' }}
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select 
            className="text-sm font-bold text-white cursor-pointer"
            style={{ backgroundColor: 'transparent', border: 'none', width: 'auto' }}
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            {['Salary', 'Food', 'Rent', 'Transport', 'Shopping', 'Other'].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-secondary text-xs uppercase font-black tracking-widest">
              <th className="p-6">Date</th>
              <th className="p-6">Category</th>
              <th className="p-6">Description</th>
              <th className="p-6 text-right">Amount</th>
              {isAdmin && <th className="p-6 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="p-20 text-center text-secondary font-bold uppercase text-xs tracking-widest">
                  Syncing stream...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="p-20 text-center text-secondary font-bold uppercase text-xs tracking-widest">
                  Zero sequence detected.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="hover:bg-white/5 transition">
                  <td className="p-6 text-xs font-mono text-secondary">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="p-6">
                    <span className="badge badge-success text-xs" style={{ fontSize: '10px' }}>{record.category}</span>
                  </td>
                  <td className="p-6">
                    <div className="text-sm font-bold">{record.description || 'Null Header'}</div>
                  </td>
                  <td className={`p-6 text-sm font-black text-right tracking-tighter ${
                    record.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {record.type === 'income' ? '+' : '-'} ₹{record.amount.toLocaleString()}
                  </td>
                  {isAdmin && (
                    <td className="p-6">
                      <div className="flex justify-center gap-4">
                        <button onClick={() => startEdit(record)} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(record.id)} style={{ color: '#f43f5e', background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-xl p-10 z-10"
              style={{ backgroundColor: '#0f111a', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase">{editingId ? 'Modify Record' : 'Record Genesis'}</h2>
                  <p className="text-secondary text-xs font-bold uppercase tracking-widest mt-1">Authorized Data Entry Protocol</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-secondary hover:text-white transition" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={28} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-secondary uppercase tracking-widest">Asset Value (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-secondary">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full font-bold"
                        style={{ paddingLeft: '32px' }}
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-secondary uppercase tracking-widest">Flow Type</label>
                    <select
                      className="w-full font-bold"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="expense">EXPENSE</option>
                      <option value="income">INCOME</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-secondary uppercase tracking-widest">Classification</label>
                    <select
                      className="w-full font-bold"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {['Salary', 'Food', 'Rent', 'Transport', 'Shopping', 'Other'].map(cat => (
                        <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-secondary uppercase tracking-widest">Temporal Header</label>
                    <input
                      type="date"
                      className="w-full font-bold"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-secondary uppercase tracking-widest">Notes</label>
                  <textarea
                    className="w-full font-medium"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      SYNCHRONIZING...
                    </>
                  ) : (
                    editingId ? 'COMMIT CHANGES' : 'EXECUTE GENESIS'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecordsPage;

