import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Shield } from 'lucide-react';

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

  if (loading) return (
    <div className="container flex flex-col items-center justify-center p-12 gap-4">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-secondary font-bold">Synchronizing access protocols...</p>
    </div>
  );

  return (
    <div className="container space-y-10">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <Shield size={16} className="text-indigo-400" />
          <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Security Protocol 442</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter">System Access Control</h1>
        <p className="text-secondary">Manage authorization headers and primary access keys.</p>
      </header>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-secondary text-xs uppercase font-black tracking-widest">
              <th className="p-8">Identity</th>
              <th className="p-8">Role</th>
              <th className="p-8 text-center">Status</th>
              <th className="p-8 text-center">Authorization</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-white/5 transition">
                <td className="p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-indigo flex items-center justify-center text-white font-black text-xs shadow-lg">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm tracking-tight">{u.name}</div>
                      <div className="text-xs text-secondary opacity-60 font-mono">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-8">
                  <span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-success'} text-xs`} style={{ fontSize: '10px' }}>
                    {u.role}
                  </span>
                </td>
                <td className="p-8 text-center">
                  <button 
                    onClick={() => handleToggleActive(u.id, u.isActive)}
                    className="badge text-xs"
                    style={{ 
                      backgroundColor: u.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                      color: u.isActive ? '#10b981' : '#f43f5e',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {u.isActive ? 'ACTIVE' : 'OFFLINE'}
                  </button>
                </td>
                <td className="p-8">
                  <div className="flex justify-center gap-2">
                    {['viewer', 'analyst', 'admin'].map(role => (
                      <button
                        key={role}
                        disabled={u.role === role}
                        onClick={() => handleRoleChange(u.id, role)}
                        className="px-3 py-1.5 text-xs uppercase font-bold rounded-lg transition"
                        style={{ 
                          backgroundColor: u.role === role ? '#6366f1' : 'rgba(255,255,255,0.05)',
                          color: u.role === role ? 'white' : '#94a3b8',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {role}
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
