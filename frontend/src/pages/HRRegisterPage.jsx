import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useState } from 'react';
import API from '../services/api';

function HRRegisterPage() {
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
        role: 'hr'
      });

      alert('HR registered successfully');
      navigate('/hr-login');
    } catch (error) {
      alert(error.response?.data?.error || 'HR registration failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page-container login-wrapper">
        <div className="login-card">
          <h2>HR Register</h2>
          <p>Create your HR account to upload resumes and shortlist candidates.</p>

          <label>Full Name</label>
          <input
            type="text"
            className="text-area"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />

          <label style={{ marginTop: '10px', display: 'block' }}>Company Email</label>
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
            placeholder="Create a password"
          />

          <button onClick={handleRegister}>Register as HR</button>

          <p style={{ marginTop: '15px' }}>
            Already have an account? <Link to="/hr-login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default HRRegisterPage;