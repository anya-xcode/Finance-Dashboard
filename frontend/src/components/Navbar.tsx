import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Database, Users, Menu } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="container flex justify-between items-center py-4">
        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          FinanceX
        </Link>

        <div className="flex gap-6 items-center">
          <Link to="/" className="flex items-center gap-2 hover:text-indigo-400 transition">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/records" className="flex items-center gap-2 hover:text-indigo-400 transition">
            <Database size={18} /> Records
          </Link>

          {user.role === 'admin' && (
            <Link to="/users" className="flex items-center gap-2 hover:text-indigo-400 transition">
              <Users size={18} /> Users
            </Link>
          )}

          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
            <div className="text-sm">
              <span className="text-secondary">Hello, </span>
              <span className="font-semibold">{user.name}</span>
            </div>
            <button onClick={handleLogout} className="p-2 hover:text-red-400 transition">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
