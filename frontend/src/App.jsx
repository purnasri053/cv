import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import RoleSelectionPage from './pages/RoleSelectionPage';
import CandidateLoginPage from './pages/CandidateLoginPage';
import HRLoginPage from './pages/HRLoginPage';
import CandidateRegisterPage from './pages/CandidateRegisterPage';
import HRRegisterPage from './pages/HRRegisterPage';
import CandidateDashboardPage from './pages/CandidateDashboardPage';
import CandidateAnalysisPage from './pages/CandidateAnalysisPage';
import HRDashboardPage from './pages/HRDashboardPage';
import HRShortlistPage from './pages/HRShortlistPage';
import DashboardPage from './pages/DashboardPage';
import AIChatBox from './components/AIChatBox';

// Redirect logged-in users away from auth pages
function GuestRoute({ element, role }) {
  const candidateUser = JSON.parse(localStorage.getItem('candidateUser'));
  const hrUser = JSON.parse(localStorage.getItem('hrUser'));
  if (candidateUser) return <Navigate to="/candidate-dashboard" replace />;
  if (hrUser) return <Navigate to="/hr-dashboard" replace />;
  return element;
}

// Redirect root based on login state
function RootRoute() {
  const candidateUser = JSON.parse(localStorage.getItem('candidateUser'));
  const hrUser = JSON.parse(localStorage.getItem('hrUser'));
  if (candidateUser) return <Navigate to="/candidate-dashboard" replace />;
  if (hrUser) return <Navigate to="/hr-dashboard" replace />;
  return <Home />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/select-role" element={<GuestRoute element={<RoleSelectionPage />} />} />
        <Route path="/candidate-login" element={<GuestRoute element={<CandidateLoginPage />} />} />
        <Route path="/hr-login" element={<GuestRoute element={<HRLoginPage />} />} />
        <Route path="/candidate-register" element={<GuestRoute element={<CandidateRegisterPage />} />} />
        <Route path="/hr-register" element={<GuestRoute element={<HRRegisterPage />} />} />
        <Route path="/candidate-dashboard" element={<CandidateDashboardPage />} />
        <Route path="/candidate-analysis" element={<CandidateAnalysisPage />} />
        <Route path="/hr-dashboard" element={<HRDashboardPage />} />
        <Route path="/hr-shortlist" element={<HRShortlistPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
      <AIChatBox />
    </Router>
  );
}

export default App;
