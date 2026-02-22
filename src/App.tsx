import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { ShieldCheck } from 'lucide-react';
import { PoolDashboard } from './pages/PoolDashboard';
import { CreatePoolPage } from './pages/CreatePoolPage';
import { SuperAdminPanel } from './pages/SuperAdminPanel';
import { CreateProposalPage } from './pages/CreateProposalPage';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#fcfaf7] flex items-center justify-center p-8">
      <div className="bg-white p-12 rounded-[40px] border border-black/5 shadow-xl text-center max-w-md">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <ShieldCheck size={40} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Payment Successful!</h1>
        <p className="text-black/40 mb-8 leading-relaxed">
          Your pool has been upgraded. You now have access to premium governance features and advanced analytics.
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full py-4 rounded-2xl bg-black text-white font-bold hover:bg-black/90 transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode, roles?: string[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <PoolDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-pool" 
            element={
              <ProtectedRoute>
                <CreatePoolPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-proposal" 
            element={
              <ProtectedRoute>
                <CreateProposalPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute roles={['superadmin']}>
                <SuperAdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
