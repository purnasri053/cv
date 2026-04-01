import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { FaFileAlt, FaEnvelope, FaLock, FaUserTie, FaCheckCircle } from 'react-icons/fa';
import API from '../services/api';

function HRLoginPage() {
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
      const response = await API.post('/login', { email, password, role: 'hr' });
      localStorage.setItem('hrUser', JSON.stringify(response.data.user));
      navigate('/hr-dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left auth-left-hr">
        <Link to="/" className="auth-brand">
          <FaFileAlt />
          <span>CVScanner</span>
        </Link>
        <div className="auth-left-content">
          <div className="auth-role-icon"><FaUserTie /></div>
          <h2>Welcome back,<br />HR Professional</h2>
          <p>Sign in to manage candidate pipelines, rank applicants, and shortlist the best talent for your roles.</p>
          <div className="auth-left-bullets">
            <div className="auth-bullet">✦ Bulk resume screening</div>
            <div className="auth-bullet">✦ AI-powered candidate ranking</div>
            <div className="auth-bullet">✦ One-click shortlisting</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <h3>Sign in to your account</h3>
          <p className="auth-form-sub">Don't have an account? <Link to="/hr-register">Create one</Link></p>

          {justRegistered && (
            <div className="auth-success">
              <FaCheckCircle /> Account created successfully! Sign in below.
            </div>
          )}
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label>Company Email</label>
            <div className="auth-input-wrap">
              <FaEnvelope className="auth-input-icon" />
              <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
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

export default HRLoginPage;
