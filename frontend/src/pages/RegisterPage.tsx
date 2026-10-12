import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Lock, Mail, User, AlertCircle, Sparkles } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <h1 className="text-2xl font-black text-white tracking-tight">Create Account</h1>
          <p className="text-xs text-slate-400">Join WatchTogether to stream and video call with your partner</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Jordan Lee"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 text-sm transition-colors"
              />
            </div>
          </div>

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
              Password (at least 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
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
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          <span>Already have an account? </span>
          <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
