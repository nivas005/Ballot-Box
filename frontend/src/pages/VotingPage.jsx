import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import './VotingPage.css';

export default function VotingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  useEffect(() => {
    loadElection();
  }, [id]);

  async function loadElection() {
    try {
      const [{ data: electionData }, { data: votedData }] = await Promise.all([
        api.get(`/elections/${id}`),
        api.get(`/votes/has-voted/${id}`)
      ]);
      setElection(electionData);
      setHasVoted(votedData.hasVoted);
    } catch (err) {
      setError(err.message || 'Failed to load election');
    } finally {
      setLoading(false);
    }
  }

  const handleVote = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setError('');
    setSubmitting(true);
    try {
      await api.post('/votes', { electionId: id, candidateId: selected });
      setSuccess(true);
      setHasVoted(true);
    } catch (err) {
      setError(err.message || 'Failed to cast vote');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async () => {
    try {
      const { data } = await api.get(`/votes/verify/${id}`);
      setVerifyResult(data);
    } catch {
      setVerifyResult({ exists: false });
    }
  };

  if (loading) return <div className="loading">Loading election...</div>;
  if (!election) return <div className="alert alert-error">{error || 'Election not found'}</div>;

  return (
    <div className="voting-page">
      <div className="container">
        <div className="voting-header">
          <button className="btn btn-ghost back-btn" onClick={() => navigate('/elections')}>
            ← Back to Elections
          </button>
          <h1>{election.title}</h1>
          {election.description && <p className="voting-desc">{election.description}</p>}
        </div>

        {election.status !== 'active' && (
          <div className="alert alert-error">
            This election is {election.status}. Voting is only allowed during active elections.
          </div>
        )}

        {hasVoted ? (
          <div className="vote-success-card">
            <div className="success-icon">✓</div>
            <h2>You have already voted</h2>
            <p>Your vote has been recorded on the blockchain and cannot be changed.</p>
            <button className="btn btn-secondary" onClick={handleVerify}>
              Verify My Vote on Blockchain
            </button>
            {verifyResult && (
              <div className="verify-result">
                {verifyResult.exists ? (
                  <div className="verify-success">
                    <p>Your vote is on the blockchain:</p>
                    <p className="mono">Block #{verifyResult.blockIndex}</p>
                    <p className="mono hash">{verifyResult.blockHash?.slice(0, 32)}...</p>
                  </div>
                ) : (
                  <p>Verification result could not be found.</p>
                )}
              </div>
            )}
          </div>
        ) : success ? (
          <div className="vote-success-card">
            <div className="success-icon">✓</div>
            <h2>Vote recorded!</h2>
            <p>Your vote has been added to the blockchain. It cannot be modified or deleted.</p>
            <button className="btn btn-primary" onClick={() => navigate('/elections')}>
              Back to Elections
            </button>
          </div>
        ) : (
          <form onSubmit={handleVote} className="voting-form">
            {error && <div className="alert alert-error">{error}</div>}

            <h2>Select your candidate</h2>
            <div className="candidates-list">
              {election.candidates?.map((c) => (
                <label key={c.id} className={`candidate-option ${selected === c.id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="candidate"
                    value={c.id}
                    checked={selected === c.id}
                    onChange={() => setSelected(c.id)}
                  />
                  <span className="candidate-name">{c.name}</span>
                </label>
              ))}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={!selected || submitting || election.status !== 'active'}
            >
              {submitting ? 'Recording vote...' : 'Cast Vote on Blockchain'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
