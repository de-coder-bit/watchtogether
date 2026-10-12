import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Lock, Mail, AlertCircle, Sparkles, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setLoading(true);
    setError(null);
    try {
      await login(demoEmail, 'password123');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-in fade-in duration-300">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl glass-modal border border-white/10 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-pink-500 to-indigo-500 flex items-center justify-center text-white mx-auto shadow-glow-brand">
            <Film className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-400">Sign in to watch movies and video call with your partner</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Fast Login Cards */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center space-x-1.5 text-[10px] font-bold text-brand-300 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>1-Click Demo Accounts (Paired Partners)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('alex@watchtogether.io')}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-brand-500/20 hover:border-brand-500/40 border border-white/10 text-xs font-semibold text-white flex items-center space-x-1.5 transition-all truncate"
            >
              <UserCheck className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span className="truncate">Alex Vance</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('sam@watchtogether.io')}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-brand-500/20 hover:border-brand-500/40 border border-white/10 text-xs font-semibold text-white flex items-center space-x-1.5 transition-all truncate"
            >
              <UserCheck className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span className="truncate">Sam Rivera</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 text-sm transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 text-sm transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 via-pink-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold text-xs shadow-glow-brand hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300 hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
