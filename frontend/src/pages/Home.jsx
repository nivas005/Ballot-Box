import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1>Ballot Box on Blockchain</h1>
          <p className="hero-subtitle">
            Decentralized, tamper-proof, and transparent online voting.
            Your vote is recorded on the blockchain and cannot be altered.
          </p>
          <div className="hero-actions">
            <Link to="/elections" className="btn btn-primary btn-lg">
              View Elections
            </Link>
            {!user && (
              <Link to="/register" className="btn btn-secondary btn-lg">
                Register to Vote
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why Blockchain Voting?</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <span className="feature-icon">🔒</span>
              <h3>Immutable</h3>
              <p>Votes are permanently recorded on the blockchain. No modification or deletion possible.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">👁️</span>
              <h3>Transparent</h3>
              <p>Public verification. Anyone can audit the blockchain to ensure integrity.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🛡️</span>
              <h3>Anonymous</h3>
              <p>Your identity is hashed. Vote is recorded without revealing who voted for whom.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to vote?</h2>
          <p>Browse active elections and cast your vote on the blockchain.</p>
          <Link to="/elections" className="btn btn-primary btn-lg">Go to Elections</Link>
        </div>
      </section>
    </div>
  );
}
