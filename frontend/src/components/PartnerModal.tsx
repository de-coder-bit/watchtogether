import React, { useState, useEffect } from 'react';
import { X, Heart, Copy, Check, UserPlus, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { partnerService } from '../services/partnerService';
import { useAuth } from '../context/AuthContext';
import { PartnerStatusResponse, PartnerInviteResponse } from '../types';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PartnerModal: React.FC<PartnerModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState<PartnerStatusResponse | null>(null);
  const [invite, setInvite] = useState<PartnerInviteResponse | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStatusAndInvite();
    }
  }, [isOpen]);

  const loadStatusAndInvite = async () => {
    setLoading(true);
    setError(null);
    try {
      const statusRes = await partnerService.getStatus();
      setStatus(statusRes);
      if (!statusRes.isPaired) {
        const inviteRes = await partnerService.createOrGetInvite();
        setInvite(inviteRes);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch partner status');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (invite?.inviteCode) {
      navigator.clipboard.writeText(invite.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await partnerService.pairWithCode(inputCode.trim().toUpperCase());
      setSuccess('Successfully paired with your partner! 🎉');
      await refreshUser();
      await loadStatusAndInvite();
      setInputCode('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to pair. Please verify code.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpair = async () => {
    if (!window.confirm('Are you sure you want to unpair from your partner?')) return;

    setLoading(true);
    setError(null);
    try {
      await partnerService.unpair();
      setSuccess('Unpaired successfully.');
      await refreshUser();
      await loadStatusAndInvite();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to unpair');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-modal rounded-2xl p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-brand-500 flex items-center justify-center shadow-glow-brand">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Partner Pairing</h2>
            <p className="text-xs text-slate-400">Connect with your favorite person to watch movies in sync with video calls</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {status?.isPaired && status.partner ? (
          /* Paired State */
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={status.partner.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${status.partner.username}`}
                  alt={status.partner.username}
                  className="w-14 h-14 rounded-full border-2 border-brand-400 bg-slate-800 object-cover shadow-glow-brand"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-white">{status.partner.username}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{status.partner.email}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed text-center">
              Whenever either of you creates a Watch Party, the other will automatically be invited and can join with one click!
            </p>

            <button
              onClick={handleUnpair}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all"
            >
              {loading ? 'Unpairing...' : 'Unpair Partner'}
            </button>
          </div>
        ) : (
          /* Unpaired State: Share Code & Enter Code */
          <div className="space-y-6">
            {/* Share Your Invite Code */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Your Pairing Code</span>
                <span className="text-[11px] text-slate-400">Share this with your partner</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 px-4 py-3 bg-black/40 border border-white/10 rounded-xl font-mono text-center text-lg font-bold tracking-widest text-brand-300 select-all">
                  {invite?.inviteCode || 'GENERATING...'}
                </div>
                <button
                  onClick={handleCopyCode}
                  disabled={!invite?.inviteCode}
                  className="px-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs flex items-center space-x-1.5 shadow-glow-brand transition-all shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="px-3 text-xs text-slate-500 font-medium uppercase">Or enter partner's code</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Enter Code to Pair */}
            <form onSubmit={handlePair} className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="e.g. 8K9P2X4W"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  maxLength={16}
                  className="flex-1 px-4 py-3 bg-black/40 border border-white/10 focus:border-brand-500 rounded-xl font-mono uppercase text-center text-base tracking-wider text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={loading || !inputCode.trim()}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-glow-brand transition-all disabled:opacity-50 shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? 'Pairing...' : 'Connect'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerModal;
