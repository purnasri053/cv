import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useState } from 'react';
import API from '../services/api';

function CandidateRegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      alert('Please fill all fields');
      return;
    }

    try {
      await API.post('/register', {
        full_name: fullName,
        email,
        password,
        role: 'candidate'
      });

      alert('Candidate registered successfully');
      navigate('/candidate-login');
    } catch (error) {
      alert(error.response?.data?.error || 'Candidate registration failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page-container login-wrapper">
        <div className="login-card">
          <h2>Candidate Register</h2>
          <p>Create your account to analyze your resume and improve your job readiness.</p>

          <label>Full Name</label>
          <input
            type="text"
            className="text-area"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />

          <label style={{ marginTop: '10px', display: 'block' }}>Email</label>
          <input
            type="email"
            className="text-area"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />

          <label style={{ marginTop: '10px', display: 'block' }}>Password</label>
          <input
            type="password"
            className="text-area"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
          />

          <button onClick={handleRegister}>Register as Candidate</button>

          <p style={{ marginTop: '15px' }}>
            Already have an account? <Link to="/candidate-login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CandidateRegisterPage;