import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../api/api';
import { Lock, Mail, ChevronRight, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user } = response.data.data;
        login(token, user);
        setEmail('');
        setPassword('');
        navigate('/');
      } else {
        setError(response.data.message || 'Authentication Protocol Failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-card w-full max-w-md p-10 z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="p-4 bg-gradient-indigo rounded-3xl mb-6 shadow-lg"
            style={{ display: 'inline-flex' }}
          >
            <TrendingUp size={32} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">Secure Access</h1>
          <p className="text-sm font-bold text-secondary uppercase tracking-widest opacity-60">FinanceX Central Protocol</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 p-4 glass-card flex items-center gap-3 text-rose-400 text-xs font-bold uppercase tracking-widest"
            style={{ borderColor: 'rgba(244, 63, 94, 0.2)' }}
          >
            <AlertCircle size={16} /> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Identity Header</label>
            <div className="relative">
              <Mail className="absolute text-secondary" size={18} style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="identity@example.com"
                className="w-full font-medium"
                style={{ paddingLeft: '48px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Access Key</label>
            <div className="relative">
              <Lock className="absolute text-secondary" size={18} style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="••••••••••••"
                className="w-full font-medium"
                style={{ paddingLeft: '48px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-sm font-bold uppercase tracking-widest gap-3"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Synchronizing...
              </>
            ) : (
              <>
                Initialize Session
                <ChevronRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-secondary text-xs font-bold uppercase tracking-widest">
            Don't have an identity yet?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4">
              Register Profile
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

