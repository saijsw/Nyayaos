import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Vote, ArrowLeft, Send, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export const CreateProposalPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.poolId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          poolId: user.poolId,
          title,
          description,
          creatorId: user.id,
          expiresAt: new Date(expiryDate).toISOString()
        }),
      });
      if (res.ok) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] p-8 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm font-bold text-black/40 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <div className="bg-white p-10 rounded-[40px] border border-black/5 shadow-xl space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Vote size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">New Proposal</h1>
              <p className="text-sm text-black/40">Draft a new governance proposal for your pool.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black/40">Proposal Title</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Allocate funds for local litigation"
                className="w-full px-5 py-4 rounded-2xl border border-black/5 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black/40">Description</label>
              <textarea 
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed context and reasoning for this proposal..."
                rows={6}
                className="w-full px-5 py-4 rounded-2xl border border-black/5 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black/40">Expiry Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                <input 
                  type="datetime-local" 
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 rounded-2xl border border-black/5 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                />
              </div>
              <p className="text-[10px] text-black/40 font-medium">Proposals will automatically close and tally votes at this time.</p>
            </div>

            <button 
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-black text-white font-bold flex items-center justify-center gap-2 hover:bg-black/90 transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Proposal'}
              {!loading && <Send size={18} />}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
