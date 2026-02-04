import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import './CreateElection.css';

export default function CreateElection() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [candidates, setCandidates] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addCandidate = () => setCandidates([...candidates, '']);
  const removeCandidate = (i) => {
    if (candidates.length <= 2) return;
    setCandidates(candidates.filter((_, idx) => idx !== i));
  };
  const updateCandidate = (i, val) => {
    const next = [...candidates];
    next[i] = val;
    setCandidates(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validCandidates = candidates.filter(c => c.trim());
    if (validCandidates.length < 2) {
      setError('At least 2 candidates required');
      return;
    }
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/elections', {
        title: title.trim(),
        description: description.trim(),
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        candidates: validCandidates.map(c => c.trim())
      });
      navigate(`/elections/${data.id}/results`);
    } catch (err) {
      setError(err.message || 'Failed to create election');
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const defaultStart = now.toISOString().slice(0, 16);
  const defaultEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="create-election">
      <div className="container">
        <header className="create-header">
          <button className="btn btn-ghost back-btn" onClick={() => navigate('/elections')}>
            ← Back
          </button>
          <h1>Create Election</h1>
          <p>Set up a new blockchain-based election</p>
        </header>

        <form onSubmit={handleSubmit} className="create-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="title">Election Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Student Council 2024"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <input
                id="startTime"
                type="datetime-local"
                value={startTime || defaultStart}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <input
                id="endTime"
                type="datetime-local"
                value={endTime || defaultEnd}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Candidates * (min 2)</label>
            {candidates.map((c, i) => (
              <div key={i} className="candidate-input-row">
                <input
                  type="text"
                  value={c}
                  onChange={(e) => updateCandidate(i, e.target.value)}
                  placeholder={`Candidate ${i + 1}`}
                  required
                />
                <button
                  type="button"
                  className="btn btn-ghost remove-btn"
                  onClick={() => removeCandidate(i)}
                  disabled={candidates.length <= 2}
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary add-btn" onClick={addCandidate}>
              + Add Candidate
            </button>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Creating...' : 'Create Election'}
          </button>
        </form>
      </div>
    </div>
  );
}
