import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { FaFileAlt, FaEnvelope, FaLock, FaUser, FaUserTie } from 'react-icons/fa';
import API from '../services/api';

function HRRegisterPage() {
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
      await API.post('/register', { full_name: fullName, email, password, role: 'hr' });
      navigate('/hr-login', { state: { registered: true } });
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.';
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
          <h2>Start hiring smarter<br />as an HR Pro</h2>
          <p>Create your HR account and let CVScanner handle the heavy lifting — from screening to shortlisting.</p>
          <div className="auth-left-bullets">
            <div className="auth-bullet">✦ Upload unlimited resumes</div>
            <div className="auth-bullet">✦ AI-ranked candidate list</div>
            <div className="auth-bullet">✦ Download shortlist reports</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <h3>Create your HR account</h3>
          <p className="auth-form-sub">Already have an account? <Link to="/hr-login">Sign in</Link></p>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label>Full Name</label>
            <div className="auth-input-wrap">
              <FaUser className="auth-input-icon" />
              <input type="text" placeholder="Your full name" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
          </div>

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

export default HRRegisterPage;
