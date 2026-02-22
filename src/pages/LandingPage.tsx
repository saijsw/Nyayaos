import React from 'react';
import { motion } from 'motion/react';
import { Scale, Shield, Users, BarChart3, Globe, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#1a1a1a] font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-black/5">
        <div className="flex items-center gap-2">
          <Scale className="w-8 h-8 text-emerald-600" />
          <span className="text-xl font-bold tracking-tight">NyayaOS Civic</span>
        </div>
        <div className="flex items-center gap-8 text-sm font-medium">
          <a href="#features" className="hover:text-emerald-600 transition-colors">Infrastructure</a>
          <a href="#governance" className="hover:text-emerald-600 transition-colors">Governance</a>
          <Link to="/login" className="px-5 py-2 rounded-full border border-black/10 hover:bg-black/5 transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="px-5 py-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 pt-24 pb-32 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-7xl font-bold tracking-tighter leading-[0.9] mb-8">
            Open-Core Civic <br />
            <span className="text-emerald-600">Infrastructure.</span>
          </h1>
          <p className="text-xl text-black/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            Empowering communities with professional-grade legal pools, 
            reputation-weighted governance, and cross-pool federations.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="px-8 py-4 rounded-full bg-black text-white text-lg font-medium hover:bg-black/90 transition-all">
              Launch Your Pool
            </Link>
            <Link to="/public" className="px-8 py-4 rounded-full border border-black/10 text-lg font-medium hover:bg-black/5 transition-all">
              Explore Transparency
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-8 py-24 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<Shield className="w-6 h-6" />}
              title="Legal War Chests"
              description="Secure, multi-tenant treasury management for community-driven litigation and civic action."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="Reputation Governance"
              description="Pro-tier weighted voting based on contribution, participation, and historical accuracy."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6" />}
              title="Civic Federation"
              description="Scale impact by forming alliances between pools to share resources and strategy."
            />
          </div>
        </div>
      </section>

      {/* Tier Comparison */}
      <section className="px-8 py-24 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold tracking-tight text-center mb-16">Choose Your Governance Level</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TierCard 
            name="Free"
            price="0"
            features={["Treasury Ledger", "Equal-weight Voting", "Public Transparency", "Audit Logs"]}
            cta="Start Free"
          />
          <TierCard 
            name="Pro"
            price="49"
            highlight
            features={["Reputation Voting", "Advanced Analytics", "Cost Projections", "Private Pools", "Custom Rules"]}
            cta="Go Pro"
          />
          <TierCard 
            name="Federation"
            price="199"
            features={["Cross-pool Alliances", "Shared War Chest", "Inter-pool Voting", "Federation Analytics"]}
            cta="Contact Sales"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 border-t border-black/5 text-center text-sm text-black/40">
        <p>© 2026 NyayaOS Civic Infrastructure. Built for the public good.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="space-y-4">
    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-xl font-bold">{title}</h3>
    <p className="text-black/60 leading-relaxed">{description}</p>
  </div>
);

const TierCard = ({ name, price, features, cta, highlight = false }: { name: string, price: string, features: string[], cta: string, highlight?: boolean }) => (
  <div className={`p-8 rounded-3xl border ${highlight ? 'border-emerald-600 bg-emerald-50/30' : 'border-black/5 bg-white'} flex flex-col`}>
    <h3 className="text-2xl font-bold mb-2">{name}</h3>
    <div className="flex items-baseline gap-1 mb-8">
      <span className="text-4xl font-bold">${price}</span>
      <span className="text-black/40">/mo</span>
    </div>
    <ul className="space-y-4 mb-12 flex-grow">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-3 text-sm font-medium text-black/70">
          <Zap className="w-4 h-4 text-emerald-600" />
          {f}
        </li>
      ))}
    </ul>
    <button className={`w-full py-3 rounded-full font-bold transition-all ${highlight ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-black text-white hover:bg-black/90'}`}>
      {cta}
    </button>
  </div>
);
