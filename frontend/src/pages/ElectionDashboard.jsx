import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import './ElectionDashboard.css';

export default function ElectionDashboard() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | ended

  useEffect(() => {
    loadElections();
  }, []);

  async function loadElections() {
    try {
      const { data } = await api.get('/elections');
      setElections(data);
    } catch (err) {
      setError(err.message || 'Failed to load elections');
    } finally {
      setLoading(false);
    }
  }

  const filtered = elections.filter(e => {
    if (filter === 'active') return e.status === 'active';
    if (filter === 'ended') return e.status === 'ended';
    return true;
  });

  const statusBadge = (status) => {
    const cls = status === 'active' ? 'badge-success' : status === 'ended' ? 'badge-secondary' : 'badge-info';
    const label = status === 'active' ? 'Active' : status === 'ended' ? 'Ended' : 'Upcoming';
    return <span className={`badge ${cls}`}>{label}</span>;
  };

  return (
    <div className="election-dashboard">
      <div className="container">
        <header className="dashboard-header">
          <h1>Election Dashboard</h1>
          <p>Browse and participate in blockchain-based elections</p>
        </header>

        <div className="filter-tabs">
          <button
            className={`tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={`tab ${filter === 'ended' ? 'active' : ''}`}
            onClick={() => setFilter('ended')}
          >
            Ended
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading">Loading elections...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>No elections found.</p>
            <Link to="/elections/create" className="btn btn-primary">Create Election</Link>
          </div>
        ) : (
          <div className="election-grid">
            {filtered.map((election) => (
              <div key={election.id} className="election-card">
                <div className="election-card-header">
                  <h3>{election.title}</h3>
                  {statusBadge(election.status)}
                </div>
                {election.description && (
                  <p className="election-desc">{election.description}</p>
                )}
                <div className="election-meta">
                  <span>Start: {new Date(election.startTime).toLocaleString()}</span>
                  <span>End: {new Date(election.endTime).toLocaleString()}</span>
                </div>
                <div className="election-actions">
                  <Link to={`/elections/${election.id}/results`} className="btn btn-secondary">
                    View Results
                  </Link>
                  {election.status === 'active' && (
                    <Link to={`/elections/${election.id}/vote`} className="btn btn-primary">
                      Vote
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
