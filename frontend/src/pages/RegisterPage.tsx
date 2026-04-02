import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import api from '../api/api';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-6 min-h-[calc(100vh-120px)]">
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div 
            key="register-form"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="glass-card w-full max-w-md p-10 relative overflow-hidden"
          >
            {/* Decorative background element */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-indigo mb-6 shadow-xl shadow-indigo-500/20">
                <User size={28} className="text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">Create Profile</h1>
              <p className="text-secondary text-xs font-bold uppercase tracking-widest">Initialize New Identity Access</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Identity Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Enter full name"
                    className="w-full pl-12 pr-4 py-4 font-bold bg-white/5 border-white/5 hover:border-white/10 focus:border-indigo-500/50 transition-all outline-none rounded-xl"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Email Header</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-4 font-bold bg-white/5 border-white/5 hover:border-white/10 focus:border-indigo-500/50 transition-all outline-none rounded-xl"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Access Secret</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    className="w-full pl-12 pr-4 py-4 font-bold bg-white/5 border-white/5 hover:border-white/10 focus:border-indigo-500/50 transition-all outline-none rounded-xl"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Confirm Secret</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input
                    type="password"
                    placeholder="Repeat access secret"
                    className="w-full pl-12 pr-4 py-4 font-bold bg-white/5 border-white/5 hover:border-white/10 focus:border-indigo-500/50 transition-all outline-none rounded-xl"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-bold uppercase tracking-wider text-center"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-5 rounded-xl text-sm font-black uppercase tracking-[0.2em] relative overflow-hidden group shadow-2xl shadow-indigo-500/30"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? 'Initializing...' : 'Join Protocol'}
                  {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </span>
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
              </motion.button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-secondary text-xs font-bold uppercase tracking-widest">
                Already part of the fleet?{' '}
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4">
                  Initialize Session
                </Link>
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="success-msg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-sm p-10 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <CheckCircle size={40} className="text-emerald-400" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase mb-4">Registration Successful</h2>
            <p className="text-secondary text-sm font-bold uppercase tracking-widest leading-relaxed">
              New identity created. Redirecting to initialization sequence...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegisterPage;
