import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Pool, Proposal, Case } from '../types';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Plus, 
  Vote, 
  Briefcase, 
  TrendingUp, 
  Settings, 
  LogOut,
  ChevronRight,
  Wallet,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  History
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuditLogViewer } from '../components/AuditLogViewer';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export const PoolDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pool, setPool] = useState<Pool | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'governance' | 'cases' | 'analytics' | 'audit' | 'subscription'>('overview');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const fetchData = async () => {
    if (!user?.poolId) return;
    try {
      const headers = { 'x-user-id': user.id };
      const [poolRes, proposalsRes] = await Promise.all([
        fetch(`/api/pools/${user.poolId}`, { headers }),
        fetch(`/api/pools/${user.poolId}/proposals`, { headers })
      ]);
      
      if (poolRes.ok && proposalsRes.ok) {
        setPool(await poolRes.json());
        setProposals(await proposalsRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: 'pro' | 'federation') => {
    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify({ poolId: pool?.id, tier }),
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!user?.poolId) {
      navigate('/create-pool');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const handleVote = async (proposalId: string, choice: 'for' | 'against') => {
    try {
      const res = await fetch(`/api/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify({ choice }),
      });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to cast vote");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!pool) return null;

  return (
    <div className="flex min-h-screen bg-[#f7f7f7]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-black/5 flex flex-col">
        <div className="p-6 border-b border-black/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
            <span className="font-bold tracking-tight">NyayaOS</span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold">{pool.name}</p>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          <SidebarLink icon={<LayoutDashboard size={18} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarLink icon={<Vote size={18} />} label="Governance" active={activeTab === 'governance'} onClick={() => setActiveTab('governance')} />
          <SidebarLink icon={<Briefcase size={18} />} label="Legal Cases" active={activeTab === 'cases'} onClick={() => setActiveTab('cases')} />
          {pool.subscriptionTier !== 'free' && (
            <SidebarLink icon={<TrendingUp size={18} />} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          )}
          <SidebarLink icon={<History size={18} />} label="Audit Logs" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
          <SidebarLink icon={<CreditCard size={18} />} label="Subscription" active={activeTab === 'subscription'} onClick={() => setActiveTab('subscription')} />
          {user?.role === 'superadmin' && (
            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-all">
              <ShieldCheck size={18} />
              Super Admin
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-black/5">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pool Overview</h1>
            <p className="text-black/40 text-sm">Welcome back, {user?.displayName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              pool.subscriptionTier === 'free' ? 'bg-gray-100 text-gray-600' :
              pool.subscriptionTier === 'pro' ? 'bg-emerald-100 text-emerald-600' :
              'bg-indigo-100 text-indigo-600'
            }`}>
              {pool.subscriptionTier} Tier
            </span>
            <button 
              onClick={() => navigate('/create-proposal')}
              className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-black/90 transition-all"
            >
              <Plus size={16} />
              New Proposal
            </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard 
                label="Treasury Balance" 
                value={`$${pool.treasuryBalance.toLocaleString()}`} 
                icon={<Wallet className="text-emerald-600" />}
                trend="+12% this month"
              />
              <StatCard 
                label="Active Proposals" 
                value={proposals.filter(p => p.status === 'active').length.toString()} 
                icon={<Vote className="text-indigo-600" />}
              />
              <StatCard 
                label="Ongoing Cases" 
                value="3" 
                icon={<Briefcase className="text-orange-600" />}
              />
              <StatCard 
                label="Reputation Score" 
                value={user?.reputationScore.toFixed(2) || "0.00"} 
                icon={<TrendingUp className="text-blue-600" />}
                trend="Top 5% in pool"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Active Proposals List */}
              <div className="lg:col-span-2 space-y-6">
                <section className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Active Proposals</h2>
                    <Link to="/proposals" className="text-sm text-emerald-600 font-medium hover:underline">View all</Link>
                  </div>
                  <div className="space-y-4">
                    {proposals.length > 0 ? proposals.map(proposal => (
                      <ProposalItem 
                        key={proposal.id} 
                        proposal={proposal} 
                        onVote={(choice) => handleVote(proposal.id, choice)}
                        onClick={() => setSelectedProposal(proposal)}
                      />
                    )) : (
                      <div className="text-center py-12 text-black/40">
                        <AlertCircle className="mx-auto mb-2 opacity-20" size={48} />
                        <p>No active proposals found.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Analytics Preview (Pro Only) */}
                {pool.subscriptionTier !== 'free' && (
                  <section className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                    <h2 className="text-xl font-bold mb-6">Treasury Growth</h2>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mockChartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                          />
                          <Line type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                )}
              </div>

              {/* Sidebar Widgets */}
              <div className="space-y-8">
                <section className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                  <h2 className="text-xl font-bold mb-6">Pool Members</h2>
                  <div className="space-y-4">
                    <MemberItem name="Sarah Chen" role="Admin" score={98} />
                    <MemberItem name="Marcus Thorne" role="Member" score={84} />
                    <MemberItem name="Elena Rodriguez" role="Member" score={72} />
                  </div>
                  <button className="w-full mt-6 py-3 rounded-xl border border-black/5 text-sm font-medium hover:bg-black/5 transition-colors">
                    Manage Members
                  </button>
                </section>

                <section className="bg-black text-white p-6 rounded-3xl shadow-xl overflow-hidden relative">
                  <div className="relative z-10">
                    <h2 className="text-xl font-bold mb-2">Civic Transparency</h2>
                    <p className="text-white/60 text-sm mb-6">Your pool is currently public. Anyone can view your treasury and proposal history.</p>
                    <button className="px-4 py-2 bg-white text-black rounded-full text-xs font-bold uppercase tracking-wider">
                      View Public Page
                    </button>
                  </div>
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
                </section>
              </div>
            </div>
          </>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
            <AuditLogViewer poolId={pool.id} />
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Subscription Management</h2>
            
            <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-1">Current Plan</p>
                  <h3 className="text-3xl font-bold capitalize">{pool.subscriptionTier}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-1">Status</p>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold uppercase tracking-wider">Active</span>
                </div>
              </div>

              {pool.subscriptionTier === 'free' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UpgradeCard 
                    title="Pro Governance" 
                    price="49" 
                    features={["Reputation Voting", "Advanced Analytics", "Cost Projections"]}
                    onUpgrade={() => handleUpgrade('pro')}
                  />
                  <UpgradeCard 
                    title="Federation" 
                    price="199" 
                    features={["Cross-pool Alliances", "Shared War Chest", "Inter-pool Voting"]}
                    onUpgrade={() => handleUpgrade('federation')}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Proposal Detail Modal */}
        {selectedProposal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Vote size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedProposal.title}</h2>
                    <p className="text-xs text-black/40 font-bold uppercase tracking-widest">Proposal Details</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedProposal(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-black/40">Description</h3>
                  <p className="text-black/70 leading-relaxed">{selectedProposal.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-black/5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2">Voting Results</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">For</span>
                        <span className="text-sm font-bold text-emerald-600">{selectedProposal.votesFor} ({selectedProposal.weightedVotesFor.toFixed(1)}w)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Against</span>
                        <span className="text-sm font-bold text-red-600">{selectedProposal.votesAgainst} ({selectedProposal.weightedVotesAgainst.toFixed(1)}w)</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-black/5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2">Timeline</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Created</span>
                        <span className="text-xs text-black/60">{new Date(selectedProposal.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Expires</span>
                        <span className="text-xs text-black/60">{new Date(selectedProposal.expiresAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedProposal.status === 'active' && (
                  <div className="pt-4 flex gap-4">
                    <button 
                      onClick={() => { handleVote(selectedProposal.id, 'for'); setSelectedProposal(null); }}
                      className="flex-grow py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                    >
                      Vote For
                    </button>
                    <button 
                      onClick={() => { handleVote(selectedProposal.id, 'against'); setSelectedProposal(null); }}
                      className="flex-grow py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                    >
                      Vote Against
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

const SidebarLink = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium transition-all ${
    active ? 'bg-emerald-50 text-emerald-600' : 'text-black/60 hover:bg-black/5'
  }`}>
    {icon}
    {label}
  </button>
);

const UpgradeCard = ({ title, price, features, onUpgrade }: any) => (
  <div className="p-6 rounded-2xl border border-black/5 bg-gray-50 flex flex-col">
    <h4 className="font-bold text-lg mb-2">{title}</h4>
    <p className="text-2xl font-bold mb-4">${price}<span className="text-sm text-black/40 font-normal">/mo</span></p>
    <ul className="space-y-2 mb-6 flex-grow">
      {features.map((f: string, i: number) => (
        <li key={i} className="text-xs text-black/60 flex items-center gap-2">
          <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
          {f}
        </li>
      ))}
    </ul>
    <button 
      onClick={onUpgrade}
      className="w-full py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-black/90 transition-all"
    >
      Upgrade Now
    </button>
  </div>
);

const StatCard = ({ label, value, icon, trend }: { label: string, value: string, icon: React.ReactNode, trend?: string }) => (
  <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-gray-50 rounded-xl">{icon}</div>
      {trend && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{trend}</span>}
    </div>
    <p className="text-black/40 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
    <p className="text-2xl font-bold tracking-tight">{value}</p>
  </div>
);

const ProposalItem: React.FC<{ proposal: Proposal, onVote?: (choice: 'for' | 'against') => void, onClick?: () => void }> = ({ proposal, onVote, onClick }) => {
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const supportRate = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
  
  const statusColors = {
    active: 'bg-blue-50 text-blue-600 border-blue-100',
    passed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rejected: 'bg-red-50 text-red-600 border-red-100',
    closed: 'bg-gray-50 text-gray-600 border-gray-100'
  };

  return (
    <div 
      onClick={onClick}
      className="p-5 rounded-3xl border border-black/5 hover:border-black/10 transition-all group bg-white cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold group-hover:text-emerald-600 transition-colors">{proposal.title}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[proposal.status]}`}>
              {proposal.status}
            </span>
          </div>
          <p className="text-sm text-black/40 line-clamp-1">{proposal.description}</p>
        </div>
        {proposal.status === 'active' && onVote && (
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onVote('for'); }}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all"
            >
              Vote For
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onVote('against'); }}
              className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-red-700 transition-all"
            >
              Vote Against
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <VoteStat label="Votes For" value={proposal.votesFor} />
        <VoteStat label="Votes Against" value={proposal.votesAgainst} />
        <VoteStat label="Weighted For" value={proposal.weightedVotesFor.toFixed(1)} />
        <VoteStat label="Weighted Against" value={proposal.weightedVotesAgainst.toFixed(1)} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-black/40">
          <span>Consensus Progress</span>
          <span>{Math.round(supportRate)}% Support</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${proposal.status === 'rejected' ? 'bg-red-500' : 'bg-emerald-500'}`}
            style={{ width: `${supportRate}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const VoteStat = ({ label, value }: { label: string, value: string | number }) => (
  <div className="bg-gray-50/50 p-2 rounded-xl border border-black/[0.02]">
    <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 mb-0.5">{label}</p>
    <p className="text-sm font-bold text-black/70">{value}</p>
  </div>
);

const MemberItem = ({ name, role, score }: { name: string, role: string, score: number }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-black/40">
        {name.charAt(0)}
      </div>
      <div>
        <p className="text-sm font-bold">{name}</p>
        <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">{role}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-bold text-emerald-600">{score}</p>
      <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">Rep</p>
    </div>
  </div>
);

const mockChartData = [
  { name: 'Jan', balance: 4000 },
  { name: 'Feb', balance: 4500 },
  { name: 'Mar', balance: 4200 },
  { name: 'Apr', balance: 5000 },
  { name: 'May', balance: 5800 },
  { name: 'Jun', balance: 6200 },
];
