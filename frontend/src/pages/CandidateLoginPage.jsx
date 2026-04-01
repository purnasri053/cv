import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useState } from 'react';
import API from '../services/api';

function CandidateLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    try {
      const response = await API.post('/login', {
        email,
        password,
        role: 'candidate'
      });

      localStorage.setItem('candidateUser', JSON.stringify(response.data.user));
      navigate('/candidate-dashboard');
    } catch (error) {
      alert(error.response?.data?.error || 'Candidate login failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page-container login-wrapper">
        <div className="login-card">
          <h2>Candidate Login</h2>
          <p>Login to analyze your resume against a target job role.</p>

          <label>Email</label>
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
            placeholder="Enter your password"
          />

          <button onClick={handleLogin}>Login as Candidate</button>
        </div>
      </div>
    </div>
  );
}

export default CandidateLoginPage;