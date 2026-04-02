import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Filter, Pencil, Trash2, X } from 'lucide-react';

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

  const isAdmin = user?.role === 'admin';

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams(filters).toString();
      const res = await api.get(`/records?${q}`);
      setRecords(res.data.data.data);
    } catch (err) {
      console.error('Fetch records failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/records/${editingId}`, formData);
      } else {
        await api.post('/records', formData);
      }
      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchRecords();
    } catch (err) {
      alert('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/records/${id}`);
      fetchRecords();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const startEdit = (record: any) => {
    setEditingId(record._id);
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

  return (
    <div className="container py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Records</h1>
          <p className="text-secondary mt-1">Manage and audit your transaction history.</p>
        </div>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Add Record
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6 flex gap-4 items-center">
        <Filter className="text-secondary" size={20} />
        <select 
          className="w-48 py-2"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select 
          className="w-48 py-2"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="Salary">Salary</option>
          <option value="Food">Food</option>
          <option value="Rent">Rent</option>
          <option value="Transport">Transport</option>
          <option value="Shopping">Shopping</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="glass-card">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 text-secondary text-sm">
              <th className="p-6 font-medium">Date</th>
              <th className="p-6 font-medium">Type</th>
              <th className="p-6 font-medium">Category</th>
              <th className="p-6 font-medium">Description</th>
              <th className="p-6 font-medium text-right">Amount</th>
              {isAdmin && <th className="p-6 font-medium text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="p-10 text-center text-secondary">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    Loading records...
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="p-10 text-center text-secondary">
                  No records found.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record._id} className="hover:bg-white/5 transition">
                  <td className="p-6 text-sm">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="p-6 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                      record.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {record.type}
                    </span>
                  </td>
                  <td className="p-6 text-sm font-medium">
                    {record.category}
                  </td>
                  <td className="p-6 text-sm text-secondary">
                    {record.description}
                  </td>
                  <td className={`p-6 text-sm font-bold text-right ${
                    record.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {record.amount.toLocaleString()}
                  </td>
                  {isAdmin && (
                    <td className="p-6">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => startEdit(record)} className="p-2 text-secondary hover:text-indigo-400 transition">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(record._id)} className="p-2 text-secondary hover:text-rose-400 transition">
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

      {/* Modern Modal For Record Creation/Editing */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-8 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingId ? 'Edit Record' : 'Create Record'}</h2>
              <button onClick={() => setShowModal(false)} className="text-secondary hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-secondary font-semibold uppercase">Amount</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-secondary font-semibold uppercase">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-secondary font-semibold uppercase">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Salary">Salary</option>
                    <option value="Food">Food</option>
                    <option value="Rent">Rent</option>
                    <option value="Transport">Transport</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-secondary font-semibold uppercase">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-secondary font-semibold uppercase">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                ></textarea>
              </div>

              <button className="btn-primary w-full py-4 text-lg mt-4 shadow-lg shadow-indigo-500/20">
                {editingId ? 'Save Changes' : 'Create Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordsPage;
