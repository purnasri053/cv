import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  const candidateUser = JSON.parse(localStorage.getItem('candidateUser'));
  const hrUser = JSON.parse(localStorage.getItem('hrUser'));

  const loggedInUser = candidateUser || hrUser;
  const userRole = candidateUser ? 'candidate' : hrUser ? 'hr' : null;

  const handleLogout = () => {
    localStorage.removeItem('candidateUser');
    localStorage.removeItem('hrUser');
    localStorage.removeItem('candidateAnalysisData');
    localStorage.removeItem('hrShortlistData');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <h2>AI Resume Screening Platform</h2>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/select-role">Roles</Link>

        {userRole === 'candidate' && (
          <Link to="/candidate-dashboard">Candidate</Link>
        )}

        {userRole === 'hr' && (
          <Link to="/hr-dashboard">HR</Link>
        )}

        {loggedInUser && (
          <>
            <span className="user-welcome">
              Welcome, {loggedInUser.full_name}
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;