import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Heart, Sparkles, Check, Users, ArrowRight } from 'lucide-react';
import { partnerService } from '../services/partnerService';
import { useAuth } from '../context/AuthContext';

export const PartnerPairPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const codeParam = searchParams.get('code') || '';
  const navigate = useNavigate();
  const { isAuthenticated, refreshUser } = useAuth();

  const [code, setCode] = useState(codeParam);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/login?redirect=/pair?code=${encodeURIComponent(code)}`);
      return;
    }
    if (!code.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const res = await partnerService.pairWithPartner(code.trim());
      await refreshUser();
      setSuccess(`Successfully paired with ${res.partner?.username}! You can now watch movies in frame-by-frame real-time sync.`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to pair with this invite code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 p-0.5 mx-auto flex items-center justify-center shadow-lg shadow-pink-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Heart className="w-8 h-8 text-pink-400 fill-pink-400/20" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Partner Invitation</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Accept this invitation to link your account with your partner.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-4 animate-in zoom-in-95">
            <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl text-emerald-300 text-xs">
              {success}
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Streaming Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handlePair} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-left">
                Invite Code
              </label>
              <input
                type="text"
                placeholder="e.g. WT-9X8K21"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-brand-300 uppercase focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-brand-600 via-indigo-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  <span>Accept &amp; Connect Partner</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
