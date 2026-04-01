import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { FaFileAlt, FaEnvelope, FaLock, FaUserGraduate, FaCheckCircle } from 'react-icons/fa';
import API from '../services/api';

function CandidateLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = location.state?.registered;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    try {
      setLoading(true);
      const response = await API.post('/login', { email, password, role: 'candidate' });
      localStorage.setItem('candidateUser', JSON.stringify(response.data.user));
      navigate('/candidate-dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <Link to="/" className="auth-brand">
          <FaFileAlt />
          <span>CVScanner</span>
        </Link>
        <div className="auth-left-content">
          <div className="auth-role-icon"><FaUserGraduate /></div>
          <h2>Welcome back,<br />Candidate</h2>
          <p>Sign in to analyze your resume, discover skill gaps, and boost your chances of landing your dream role.</p>
          <div className="auth-left-bullets">
            <div className="auth-bullet">✦ Resume skill gap analysis</div>
            <div className="auth-bullet">✦ Match score against job roles</div>
            <div className="auth-bullet">✦ Personalized improvement tips</div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-box">
          <h3>Sign in to your account</h3>
          <p className="auth-form-sub">Don't have an account? <Link to="/candidate-register">Create one</Link></p>

          {justRegistered && (
            <div className="auth-success">
              <FaCheckCircle /> Account created successfully! Sign in below.
            </div>
          )}
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label>Email address</label>
            <div className="auth-input-wrap">
              <FaEnvelope className="auth-input-icon" />
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="auth-input-wrap">
              <FaLock className="auth-input-icon" />
              <input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
          </div>

          <button className="auth-btn" onClick={handleLogin} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="auth-divider"><span>or</span></div>
          <Link to="/select-role" className="auth-back">← Back to role selection</Link>
        </div>
      </div>
    </div>
  );
}

export default CandidateLoginPage;
