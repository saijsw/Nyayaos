import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Globe, Lock, ArrowRight, Check } from 'lucide-react';
import { motion } from 'motion/react';

export const CreatePoolPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tier, setTier] = useState<'free' | 'pro' | 'federation'>('free');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/pools', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          name,
          description,
          subscriptionTier: tier,
          isPrivate,
          adminId: user.id
        }),
      });
      if (res.ok) {
        // Refresh user data to get the new poolId
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        });
        if (loginRes.ok) {
          const updatedUser = await loginRes.json();
          localStorage.setItem('nyaya_user', JSON.stringify(updatedUser));
          window.location.href = '/dashboard';
        }
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
        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12"
      >
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Launch Your Pool</h1>
            <p className="text-black/40 leading-relaxed">
              Define your community's legal boundaries and governance model. 
              You can upgrade your tier or change settings later.
            </p>
          </div>

          <div className="space-y-6">
            <TierOption 
              active={tier === 'free'} 
              onClick={() => setTier('free')}
              icon={<Shield className="text-gray-400" />}
              title="Free Tier"
              description="Basic treasury and equal-weight voting."
            />
            <TierOption 
              active={tier === 'pro'} 
              onClick={() => setTier('pro')}
              icon={<Shield className="text-emerald-600" />}
              title="Pro Tier"
              description="Reputation voting and cost projections."
              badge="Recommended"
            />
            <TierOption 
              active={tier === 'federation'} 
              onClick={() => setTier('federation')}
              icon={<Globe className="text-indigo-600" />}
              title="Federation"
              description="Cross-pool alliances and shared war chests."
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-black/5 shadow-xl space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-black/40">Pool Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Green Valley Legal Defense"
              className="w-full px-4 py-4 rounded-2xl border border-black/5 bg-gray-50 focus:bg-white focus:border-emerald-600 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-black/40">Description</label>
            <textarea 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is the mission of this pool?"
              rows={4}
              className="w-full px-4 py-4 rounded-2xl border border-black/5 bg-gray-50 focus:bg-white focus:border-emerald-600 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-black/5">
            <div className="flex items-center gap-3">
              {isPrivate ? <Lock size={20} className="text-black/40" /> : <Globe size={20} className="text-emerald-600" />}
              <div>
                <p className="text-sm font-bold">{isPrivate ? 'Private Pool' : 'Public Pool'}</p>
                <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">Visibility</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`w-12 h-6 rounded-full transition-all relative ${isPrivate ? 'bg-black' : 'bg-emerald-500'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPrivate ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-black text-white font-bold flex items-center justify-center gap-2 hover:bg-black/90 transition-all disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Initialize Pool'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const TierOption = ({ active, onClick, icon, title, description, badge }: any) => (
  <button 
    onClick={onClick}
    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${
      active ? 'border-emerald-600 bg-emerald-50 shadow-sm' : 'border-black/5 bg-white hover:border-black/10'
    }`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${active ? 'bg-white' : 'bg-gray-50'}`}>
      {icon}
    </div>
    <div className="flex-grow">
      <div className="flex items-center gap-2">
        <h3 className="font-bold">{title}</h3>
        {badge && <span className="text-[8px] font-bold uppercase tracking-widest bg-emerald-600 text-white px-2 py-0.5 rounded-full">{badge}</span>}
      </div>
      <p className="text-xs text-black/40">{description}</p>
    </div>
    {active && <Check size={18} className="text-emerald-600" />}
  </button>
);
