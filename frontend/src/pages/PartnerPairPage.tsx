import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { partnerService } from '../services/partnerService';
import { useAuth } from '../context/AuthContext';
import { Heart, Check, AlertCircle, Sparkles, UserPlus, ArrowRight } from 'lucide-react';

export const PartnerPairPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setCode(codeParam.toUpperCase());
    }
  }, [searchParams]);

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await partnerService.pairWithCode(code.trim().toUpperCase());
      setSuccess(`Successfully paired with ${res.partner?.username || 'your partner'}!`);
      await refreshUser();
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to pair. Please check code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-in fade-in duration-300">
      <div className="w-full max-w-md p-8 rounded-3xl glass-modal border border-white/10 shadow-2xl space-y-6 text-center">
        
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 to-brand-500 flex items-center justify-center text-white mx-auto shadow-glow-brand">
          <Heart className="w-8 h-8 fill-white" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Partner Pairing</h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect your accounts together to watch movies synchronously and jump into face-to-face video calls.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center space-x-2.5 text-left">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2.5 text-left">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handlePair} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Enter Partner Invite Code
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 8K9P2X4W"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/10 text-center font-mono uppercase text-lg tracking-widest text-brand-300 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold text-xs shadow-glow-brand disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Pairing...' : 'Confirm Pairing'}</span>
          </button>
        </form>

        <div className="pt-2 border-t border-white/10 text-xs text-slate-500">
          <Link to="/" className="text-brand-400 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PartnerPairPage;
