import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout({ children }) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            <span className="logo-icon">🗳️</span>
            Ballot Box
          </Link>
          <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/elections">Elections</Link>
            <Link to="/blockchain">Blockchain</Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/elections/create">Create Election</Link>
                )}
                <span className="user-badge">{user.name}</span>
                <button className="btn btn-ghost" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="main">
        {loading ? (
          <div className="loading-screen">Loading...</div>
        ) : (
          children
        )}
      </main>
      <footer className="footer">
        <div className="container">
          <p>Ballot Box on Blockchain — Decentralized, tamper-proof voting</p>
        </div>
      </footer>
    </div>
  );
}
