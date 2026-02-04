import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import './BlockchainExplorer.css';

export default function BlockchainExplorer() {
  const [chain, setChain] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBlockchain();
  }, []);

  async function loadBlockchain() {
    try {
      const { data } = await api.get('/blockchain');
      setChain(data.chain || []);
      setIsValid(data.isValid ?? false);
    } catch (err) {
      setError(err.message || 'Failed to load blockchain');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="loading">Loading blockchain...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="blockchain-explorer">
      <div className="container">
        <header className="explorer-header">
          <h1>Blockchain Explorer</h1>
          <p>Public audit of the voting blockchain. All votes are recorded here.</p>
          <div className={`validity-badge ${isValid ? 'valid' : 'invalid'}`}>
            Chain {isValid ? '✓ Valid' : '✗ Invalid'}
          </div>
        </header>

        <div className="blocks-list">
          {chain.map((block) => (
            <div key={block.index} className="block-card">
              <div className="block-header">
                <span className="block-index">Block #{block.index}</span>
                <span className="block-tx">{block.transactionCount} vote(s)</span>
              </div>
              <div className="block-details">
                <div className="detail-row">
                  <span className="label">Timestamp</span>
                  <span className="value">{new Date(block.timestamp).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Previous Hash</span>
                  <span className="value mono hash">{block.previousHash?.slice(0, 24)}...</span>
                </div>
                <div className="detail-row">
                  <span className="label">Block Hash</span>
                  <span className="value mono hash">{block.hash?.slice(0, 24)}...</span>
                </div>
                <div className="detail-row">
                  <span className="label">Nonce</span>
                  <span className="value">{block.nonce}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
