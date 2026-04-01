import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaFileAlt } from 'react-icons/fa';

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const candidateUser = JSON.parse(localStorage.getItem('candidateUser'));
  const hrUser = JSON.parse(localStorage.getItem('hrUser'));
  const loggedInUser = candidateUser || hrUser;
  const userRole = candidateUser ? 'candidate' : hrUser ? 'hr' : null;

  const handleLogout = () => {
    localStorage.removeItem('candidateUser');
    localStorage.removeItem('hrUser');
    localStorage.removeItem('candidateAnalysisData');
    localStorage.removeItem('hrShortlistData');
    setMenuOpen(false);
    navigate('/');
  };

  const close = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      {/* Brand */}
      <Link to="/" className="navbar-brand" onClick={close}>
        <FaFileAlt className="navbar-brand-icon" />
        <span>CVScanner</span>
      </Link>

      {/* Desktop links */}
      <div className="nav-links">
        {!loggedInUser && <Link to="/">Home</Link>}
        {!loggedInUser && <Link to="/select-role">Roles</Link>}
        {userRole === 'candidate' && <Link to="/candidate-dashboard">Dashboard</Link>}
        {userRole === 'hr' && <Link to="/hr-dashboard">Dashboard</Link>}
        {loggedInUser && (
          <>
            <span className="user-welcome">Hi, {loggedInUser.full_name.split(' ')[0]}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          <div className="nav-overlay" onClick={close} />
          <div className="nav-drawer">
            <div className="nav-drawer-header">
              <FaFileAlt className="navbar-brand-icon" />
              <span>CVScanner</span>
            </div>
            {loggedInUser && (
              <div className="nav-drawer-user">
                <div className="nav-drawer-avatar">
                  {loggedInUser.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="nav-drawer-name">{loggedInUser.full_name}</div>
                  <div className="nav-drawer-role">{userRole === 'hr' ? 'HR Professional' : 'Candidate'}</div>
                </div>
              </div>
            )}
            {/* Only show nav links when NOT logged in */}
            {!loggedInUser && (
              <div className="nav-drawer-links">
                <Link to="/" onClick={close}>Home</Link>
                <Link to="/select-role" onClick={close}>Roles</Link>
              </div>
            )}
            {loggedInUser && (
              <button className="nav-drawer-logout" onClick={handleLogout}>Logout</button>
            )}
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;
