import Navbar from '../components/Navbar';
import CandidateTable from '../components/CandidateTable';
import { Link } from 'react-router-dom';

function RankingPage() {
  const storedData = JSON.parse(localStorage.getItem('analysisData'));
  const candidates = storedData?.rankedCandidates || [];

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h2>Candidate Ranking</h2>
        <p>
          Based on the skill matching score, candidates are ranked from highest to lowest suitability.
        </p>

        <CandidateTable candidates={candidates} />

        {candidates.length > 0 && (
          <div className="top-candidate-box">
            <h3>🏆 Top Candidate: {candidates[0].name}</h3>
          </div>
        )}

        <Link to="/dashboard">
          <button>Go to Dashboard</button>
        </Link>
      </div>
    </div>
  );
}

export default RankingPage;