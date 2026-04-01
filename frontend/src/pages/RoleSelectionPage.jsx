import { Link } from 'react-router-dom';
import { FaUserTie, FaUserGraduate, FaFileAlt, FaArrowRight } from 'react-icons/fa';

function RoleSelectionPage() {
  return (
    <div className="role-select-page">
      {/* Top nav */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <FaFileAlt className="landing-logo-icon" />
          <span>CVScanner</span>
        </div>
      </nav>

      <div className="role-select-body">
        <div className="role-select-header">
          <div className="hero-badge">Get Started</div>
          <h1>Who are you?</h1>
          <p>Choose your role to continue. You can always switch later.</p>
        </div>

        <div className="role-select-grid">
          {/* Candidate Card */}
          <div className="role-select-card">
            <div className="role-select-icon-wrap role-icon-candidate">
              <FaUserGraduate />
            </div>
            <h2>Candidate</h2>
            <p>Upload your resume, compare it with a job role, and discover exactly what skills you need to get hired.</p>
            <ul className="role-select-perks">
              <li>✦ Resume skill gap analysis</li>
              <li>✦ Match score against any role</li>
              <li>✦ Personalized improvement tips</li>
            </ul>
            <div className="role-select-actions">
              <Link to="/candidate-login">
                <button className="role-btn-primary">Sign In <FaArrowRight /></button>
              </Link>
              <Link to="/candidate-register">
                <button className="role-btn-outline">Create Account</button>
              </Link>
            </div>
          </div>

          {/* HR Card */}
          <div className="role-select-card role-select-card-hr">
            <div className="role-select-icon-wrap role-icon-hr">
              <FaUserTie />
            </div>
            <h2>HR / Recruiter</h2>
            <p>Upload multiple resumes, rank candidates by match score, and shortlist the best profiles in seconds.</p>
            <ul className="role-select-perks">
              <li>✦ Bulk resume screening</li>
              <li>✦ AI-powered candidate ranking</li>
              <li>✦ One-click shortlist reports</li>
            </ul>
            <div className="role-select-actions">
              <Link to="/hr-login">
                <button className="role-btn-primary">Sign In <FaArrowRight /></button>
              </Link>
              <Link to="/hr-register">
                <button className="role-btn-outline">Create Account</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleSelectionPage;
