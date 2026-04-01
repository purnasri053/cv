import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { FaFileAlt, FaEnvelope, FaLock, FaUser, FaUserGraduate } from 'react-icons/fa';
import API from '../services/api';

function CandidateRegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!fullName || !email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    try {
      setLoading(true);
      await API.post('/register', { full_name: fullName, email, password, role: 'candidate' });
      navigate('/candidate-login', { state: { registered: true } });
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <Link to="/" className="auth-brand">
          <FaFileAlt />
          <span>CVScanner</span>
        </Link>
        <div className="auth-left-content">
          <div className="auth-role-icon"><FaUserGraduate /></div>
          <h2>Start your journey<br />as a Candidate</h2>
          <p>Create a free account and get instant feedback on how well your resume matches any job role.</p>
          <div className="auth-left-bullets">
            <div className="auth-bullet">✦ Free resume analysis</div>
            <div className="auth-bullet">✦ Skill gap identification</div>
            <div className="auth-bullet">✦ Actionable improvement tips</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <h3>Create your account</h3>
          <p className="auth-form-sub">Already have an account? <Link to="/candidate-login">Sign in</Link></p>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label>Full Name</label>
            <div className="auth-input-wrap">
              <FaUser className="auth-input-icon" />
              <input type="text" placeholder="Your full name" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
          </div>

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
              <input type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRegister()} />
            </div>
          </div>

          <button className="auth-btn" onClick={handleRegister} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="auth-divider"><span>or</span></div>
          <Link to="/select-role" className="auth-back">← Back to role selection</Link>
        </div>
      </div>
    </div>
  );
}

export default CandidateRegisterPage;
