import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Pool, AuditLog } from '../types';
import { Shield, Globe, Users, BarChart3, Search, AlertTriangle, CheckCircle, XCircle, Plus } from 'lucide-react';
import { AuditLogViewer } from '../components/AuditLogViewer';
import { Link, useNavigate } from 'react-router-dom';

export const SuperAdminPanel: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pools' | 'audit' | 'analytics'>('pools');

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      navigate('/dashboard');
      return;
    }

    const fetchPools = async () => {
      try {
        const res = await fetch('/api/pools', {
          headers: { 'x-user-id': user?.id || '' }
        });
        if (res.ok) {
          setPools(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, [user, navigate]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#fcfaf7]">
      {/* Header */}
      <header className="bg-white border-b border-black/5 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
              <Shield className="w-6 h-6 text-indigo-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Super Admin Panel</h1>
              <p className="text-xs text-black/40 font-bold uppercase tracking-widest">Global Governance Control</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl">
              <TabButton active={activeTab === 'pools'} onClick={() => setActiveTab('pools')} label="Pools" icon={<Globe size={14} />} />
              <TabButton active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} label="Global Audit" icon={<Search size={14} />} />
              <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} label="Impact" icon={<BarChart3 size={14} />} />
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        {activeTab === 'pools' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Active Legal Pools</h2>
              <div className="flex items-center gap-4">
                <Link 
                  to="/create-pool"
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-full text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm"
                >
                  <Plus size={16} />
                  Create Pool
                </Link>
                <div className="bg-white px-4 py-2 rounded-xl border border-black/5 flex items-center gap-2">
                  <Users size={16} className="text-black/20" />
                  <span className="text-sm font-bold">{pools.length} Pools Total</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pools.map(pool => (
                <div key={pool.id} className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-bold text-black/20 text-xl">
                      {pool.name.charAt(0)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${
                      pool.subscriptionTier === 'free' ? 'bg-gray-100 text-gray-600' :
                      pool.subscriptionTier === 'pro' ? 'bg-emerald-100 text-emerald-600' :
                      'bg-indigo-100 text-indigo-600'
                    }`}>
                      {pool.subscriptionTier}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-1">{pool.name}</h3>
                  <p className="text-sm text-black/40 line-clamp-2 mb-6">{pool.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-black/5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs font-bold text-black/60">Active</span>
                    </div>
                    <button className="text-xs font-bold text-red-600 hover:underline">Freeze Pool</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Global Audit Logs</h2>
            <AuditLogViewer global />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white p-12 rounded-[40px] border border-black/5 text-center space-y-6">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto">
              <BarChart3 size={40} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Civic Impact Dashboard</h2>
            <p className="text-black/40 max-w-md mx-auto">
              Aggregated data on litigation success rates, community participation, and resource allocation across all pools.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
              <div className="p-6 rounded-3xl bg-gray-50">
                <p className="text-4xl font-bold text-emerald-600 mb-1">$1.2M</p>
                <p className="text-xs font-bold uppercase tracking-widest text-black/40">Total War Chests</p>
              </div>
              <div className="p-6 rounded-3xl bg-gray-50">
                <p className="text-4xl font-bold text-indigo-600 mb-1">42</p>
                <p className="text-xs font-bold uppercase tracking-widest text-black/40">Active Federations</p>
              </div>
              <div className="p-6 rounded-3xl bg-gray-50">
                <p className="text-4xl font-bold text-orange-600 mb-1">89%</p>
                <p className="text-xs font-bold uppercase tracking-widest text-black/40">Success Rate</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const TabButton = ({ active, onClick, label, icon }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
      active ? 'bg-white text-black shadow-sm' : 'text-black/40 hover:text-black/60'
    }`}
  >
    {icon}
    {label}
  </button>
);
