import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useState } from 'react';
import API from '../services/api';

function HRLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter company email and password');
      return;
    }

    try {
      const response = await API.post('/login', {
        email,
        password,
        role: 'hr'
      });

      localStorage.setItem('hrUser', JSON.stringify(response.data.user));
      navigate('/hr-dashboard');
    } catch (error) {
      alert(error.response?.data?.error || 'HR login failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page-container login-wrapper">
        <div className="login-card">
          <h2>HR Login</h2>
          <p>Login to manage candidate shortlisting and hiring workflows.</p>

          <label>Company Email</label>
          <input
            type="email"
            className="text-area"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter company email"
          />

          <label style={{ marginTop: '10px', display: 'block' }}>Password</label>
          <input
            type="password"
            className="text-area"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />

          <button onClick={handleLogin}>Login as HR</button>
        </div>
      </div>
    </div>
  );
}

export default HRLoginPage;