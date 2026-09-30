import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Heart, Users, UserPlus, Trash2, Sparkles } from 'lucide-react';
import { partnerService } from '../../services/partnerService';
import { useAuth } from '../../context/AuthContext';
import { PartnerStatusResponse } from '../../types';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PartnerModal: React.FC<PartnerModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const [partnerStatus, setPartnerStatus] = useState<PartnerStatusResponse | null>(null);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await partnerService.getPartnerStatus();
      setPartnerStatus(res);
      if (res.activeInviteCode) {
        setGeneratedCode(res.activeInviteCode);
      }
    } catch (err: any) {
      setError('Failed to load partner status');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvite = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await partnerService.generateInviteCode();
      setGeneratedCode(res.inviteCode);
      setSuccess('Invite code generated! Share it with your partner.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate invite code');
    } finally {
      setLoading(false);
    }
  };

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const res = await partnerService.pairWithPartner(inviteCodeInput.trim());
      setPartnerStatus(res);
      await refreshUser();
      setSuccess(`Successfully paired with ${res.partner?.username}! ❤️`);
      setInviteCodeInput('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to pair with this invite code');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpair = async () => {
    if (!window.confirm('Are you sure you want to unpair from your partner?')) return;

    try {
      setLoading(true);
      setError(null);
      await partnerService.unpairPartner();
      await refreshUser();
      await loadStatus();
      setSuccess('Successfully unpaired.');
    } catch (err: any) {
      setError('Failed to unpair');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-400 fill-pink-400/30" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Partner Connection</h2>
            <p className="text-xs text-slate-400">Stream together in sync from anywhere in the world</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Currently Paired State */}
        {partnerStatus?.isPaired ? (
          <div className="space-y-6">
            <div className="p-5 bg-gradient-to-b from-slate-800/60 to-slate-800/20 border border-slate-700/60 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <img
                  src={partnerStatus.partner?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${partnerStatus.partner?.username}`}
                  alt="Partner Avatar"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-pink-500/50 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base text-white">{partnerStatus.partner?.username}</span>
                    <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                  </div>
                  <p className="text-xs text-slate-400">{partnerStatus.partner?.email}</p>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Paired & Ready to Sync
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleUnpair}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-800 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Unpair Partner
            </button>
          </div>
        ) : (
          /* Not Paired: Generate Invite Code or Enter Partner Code */
          <div className="space-y-6">
            {/* Step A: Share your invite code */}
            <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brand-400" />
                  Option 1: Share Your Invite Code
                </span>
                {!generatedCode && (
                  <button
                    onClick={handleGenerateInvite}
                    disabled={loading}
                    className="text-xs font-semibold text-brand-400 hover:text-brand-300 underline"
                  >
                    Generate Code
                  </button>
                )}
              </div>

              {generatedCode ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-center font-mono font-bold text-lg text-brand-300 tracking-wider">
                    {generatedCode}
                  </div>
                  <button
                    onClick={() => handleCopy(generatedCode)}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
                    title="Copy Code"
                  >
                    {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Click "Generate Code" to create a unique pairing link for your partner.
                </p>
              )}
            </div>

            {/* Step B: Enter Partner's Code */}
            <form onSubmit={handlePair} className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Option 2: Enter Partner's Code
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. WT-97XA42"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white uppercase placeholder-slate-500 font-mono tracking-wide focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  disabled={loading || !inviteCodeInput.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
                >
                  Pair
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
