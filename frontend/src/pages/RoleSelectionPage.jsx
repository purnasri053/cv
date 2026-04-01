import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaUserTie, FaUserGraduate } from 'react-icons/fa';

function RoleSelectionPage() {
  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="role-header">
          <h2>Select Your Role</h2>
          <p>
            Choose your role to continue with the platform. Candidates can analyze
            resumes and improve job readiness, while HR professionals can upload
            multiple resumes and shortlist the best applicants.
          </p>
        </div>

        <div className="role-grid">
          <div className="role-card">
            <FaUserGraduate className="role-icon" />
            <h3>Candidate / Employee</h3>
            <p>
              Upload your resume, compare it with a target job role, and identify
              missing skills to improve your chances.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/candidate-login">
                <button>Candidate Login</button>
              </Link>
              <Link to="/candidate-register">
                <button>Candidate Register</button>
              </Link>
            </div>
          </div>

          <div className="role-card">
            <FaUserTie className="role-icon" />
            <h3>HR / Recruiter</h3>
            <p>
              Upload multiple resumes, analyze candidate suitability, rank applicants,
              and shortlist the best profiles for interview.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/hr-login">
                <button>HR Login</button>
              </Link>
              <Link to="/hr-register">
                <button>HR Register</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleSelectionPage;