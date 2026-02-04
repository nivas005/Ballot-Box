import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ElectionDashboard from './pages/ElectionDashboard';
import VotingPage from './pages/VotingPage';
import ResultsPage from './pages/ResultsPage';
import CreateElection from './pages/CreateElection';
import BlockchainExplorer from './pages/BlockchainExplorer';
import { useAuth } from './context/AuthContext';

function PrivateRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/elections" element={<ElectionDashboard />} />
        <Route path="/elections/:id/vote" element={
          <PrivateRoute>
            <VotingPage />
          </PrivateRoute>
        } />
        <Route path="/elections/:id/results" element={<ResultsPage />} />
        <Route path="/blockchain" element={<BlockchainExplorer />} />
        <Route path="/elections/create" element={
          <PrivateRoute adminOnly>
            <CreateElection />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
