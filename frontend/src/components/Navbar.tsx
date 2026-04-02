import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Database, Users, TrendingUp } from 'lucide-react';

const NavLink: React.FC<{ to: string; icon: any; label: string; active: boolean }> = ({ to, icon: Icon, label, active }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <motion.div 
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
        active ? 'text-white' : 'text-white/60 hover:text-white'
      }`}
      style={{ 
        backgroundColor: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
        border: '1px solid',
        borderColor: active ? 'rgba(99, 102, 241, 0.2)' : 'transparent'
      }}
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon size={18} className={active ? 'text-indigo-400' : 'text-inherit'} />
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </motion.div>
  </Link>
);

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-4 z-50 mx-auto max-w-7xl px-4 w-full"
    >
      <div className="glass-nav rounded-2xl flex justify-between items-center px-8 py-3 shadow-2xl w-full" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <div className="p-2 bg-gradient-indigo rounded-lg shadow-lg">
            <TrendingUp size={20} className="text-white" />
          </div>
          <span className="text-xl font-black text-gradient uppercase tracking-tighter">FinanceX</span>
        </Link>

        <div className="flex gap-4 items-center">
          <div className="flex gap-2">
            <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/dashboard'} />
            <NavLink to="/records" icon={Database} label="Records" active={location.pathname === '/records'} />
            {user.role?.toLowerCase() === 'admin' && (
              <NavLink to="/users" icon={Users} label="Users" active={location.pathname === '/users'} />
            )}
          </div>

          <div className="flex items-center gap-6" style={{ marginLeft: '1.5rem', paddingLeft: '1.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="text-right" style={{ fontSize: '0.75rem' }}>
              <p className="text-secondary opacity-60 font-bold uppercase tracking-widest" style={{ fontSize: '10px' }}>{user.role}</p>
              <p className="font-bold text-white" style={{ fontSize: '0.875rem' }}>{user.name}</p>
            </div>
            
            <motion.button 
              onClick={handleLogout} 
              className="p-2.5 rounded-xl bg-rose-500 shadow-lg"
              style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#fb7185', border: 'none', cursor: 'pointer' }}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(244, 63, 94, 0.2)' }}
              whileTap={{ scale: 0.9 }}
            >
              <LogOut size={20} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;

