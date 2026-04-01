import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/select-role" element={<RoleSelectionPage />} />
        <Route path="/candidate-login" element={<CandidateLoginPage />} />
        <Route path="/hr-login" element={<HRLoginPage />} />
        <Route path="/candidate-register" element={<CandidateRegisterPage />} />
        <Route path="/hr-register" element={<HRRegisterPage />} />
        <Route path="/candidate-dashboard" element={<CandidateDashboardPage />} />
        <Route path="/candidate-analysis" element={<CandidateAnalysisPage />} />
        <Route path="/hr-dashboard" element={<HRDashboardPage />} />
        <Route path="/hr-shortlist" element={<HRShortlistPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;