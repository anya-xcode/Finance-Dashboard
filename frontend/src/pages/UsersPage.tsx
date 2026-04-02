import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { X, Check, Loader2 } from 'lucide-react';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error('Fetch users failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await api.patch(`/users/${id}`, { isActive: !current });
      fetchUsers();
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await api.patch(`/users/${id}`, { role });
      fetchUsers();
    } catch (err) {
      alert('Role change failed');
    }
  };

  if (loading) return <div className="container p-10 text-center"><Loader2 className="animate-spin inline-block mr-2" /> Loading users...</div>;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">System Access Management</h1>
        <p className="text-secondary mt-1">Audit and modify user roles and permissions.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 text-secondary text-sm">
              <th className="p-6 font-medium">Name</th>
              <th className="p-6 font-medium">Email</th>
              <th className="p-6 font-medium text-center">Current Role</th>
              <th className="p-6 font-medium text-center">Status</th>
              <th className="p-6 font-medium text-center">Update Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-white/5 transition">
                <td className="p-6 font-medium">{u.name}</td>
                <td className="p-6 text-sm text-secondary">{u.email}</td>
                <td className="p-6 text-center">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 
                    u.role === 'analyst' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex justify-center">
                    <button 
                      onClick={() => handleToggleActive(u.id, u.isActive)}
                      className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border transition ${
                        u.isActive 
                        ? 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10' 
                        : 'border-rose-500/30 text-rose-500 hover:bg-rose-500/10'
                      }`}
                    >
                      {u.isActive ? <Check size={14} /> : <X size={14} />}
                      {u.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex justify-center gap-2">
                    {['viewer', 'analyst', 'admin'].map(r => (
                      <button
                        key={r}
                        disabled={u.role === r}
                        onClick={() => handleRoleChange(u.id, r)}
                        className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition ${
                          u.role === r 
                          ? 'bg-white/10 text-white cursor-default' 
                          : 'bg-white/5 text-secondary hover:text-white hover:bg-indigo-500/30'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
