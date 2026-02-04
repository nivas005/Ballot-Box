import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import './ResultsPage.css';

export default function ResultsPage() {
  const { id } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadResults();
  }, [id]);

  async function loadResults() {
    try {
      const { data } = await api.get(`/elections/${id}/results`);
      setResults(data);
    } catch (err) {
      setError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }

  const refresh = async () => {
    setRefreshing(true);
    await loadResults();
    setRefreshing(false);
  };

  if (loading) return <div className="loading">Loading results...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!results) return null;

  const { election, results: voteResults, totalVotes } = results;
  const maxVotes = Math.max(...voteResults.map(r => r.votes), 1);

  return (
    <div className="results-page">
      <div className="container">
        <header className="results-header">
          <Link to="/elections" className="btn btn-ghost back-btn">← Back to Elections</Link>
          <h1>{election.title}</h1>
          <p className="results-subtitle">Live results from the blockchain</p>
        </header>

        <div className="results-card">
          <div className="results-header-row">
            <h2>Vote Count</h2>
            <button className="btn btn-secondary btn-sm" onClick={refresh} disabled={refreshing}>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="total-votes">
            <span className="total-label">Total Votes</span>
            <span className="total-value">{totalVotes}</span>
          </div>

          <div className="results-list">
            {voteResults
              .sort((a, b) => b.votes - a.votes)
              .map((c) => (
                <div key={c.id} className="result-row">
                  <div className="result-info">
                    <span className="candidate-name">{c.name}</span>
                    <span className="vote-count">{c.votes} {c.votes === 1 ? 'vote' : 'votes'}</span>
                  </div>
                  <div className="result-bar-container">
                    <div
                      className="result-bar"
                      style={{ width: `${(c.votes / maxVotes) * 100}%` }}
                    />
                  </div>
                  <span className="result-percent">
                    {totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="blockchain-info">
          <p>All votes are stored on the blockchain. Results are tamper-proof and auditable.</p>
          <Link to="/elections" className="btn btn-secondary">
            Vote
          </Link>
        </div>
      </div>
    </div>
  );
}
