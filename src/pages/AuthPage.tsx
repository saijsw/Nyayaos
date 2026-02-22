import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, Mail, User, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const AuthPage: React.FC<{ mode: 'login' | 'register' }> = ({ mode }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email);
      } else {
        await register(email, displayName);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] flex flex-col md:flex-row">
      {/* Left Side - Narrative */}
      <div className="hidden md:flex md:w-1/2 bg-emerald-600 p-16 flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <Scale className="w-8 h-8" />
            <span className="text-2xl font-bold tracking-tight">NyayaOS</span>
          </Link>
          <h2 className="text-6xl font-bold tracking-tighter leading-tight mb-8">
            The infrastructure <br /> for a more <br /> just society.
          </h2>
          <p className="text-xl text-white/80 max-w-md leading-relaxed">
            Join thousands of communities using NyayaOS to manage legal pools, 
            coordinate civic action, and build transparent governance.
          </p>
        </div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-emerald-600 bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <p className="text-sm font-medium">Joined by 1,200+ civic leaders this week</p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-grow flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-black/40 mb-8">
            {mode === 'login' 
              ? "Enter your credentials to access your pool dashboard." 
              : "Start your journey towards professional civic governance."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-black/40">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                  <input 
                    type="text" 
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-black/5 bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black/40">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-black/5 bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

            <button 
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-black text-white font-bold flex items-center justify-center gap-2 hover:bg-black/90 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-black/5 text-center">
            <p className="text-sm text-black/40">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
              <Link to={mode === 'login' ? '/register' : '/login'} className="text-emerald-600 font-bold hover:underline">
                {mode === 'login' ? 'Register now' : 'Sign in'}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
