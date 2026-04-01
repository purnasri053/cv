import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import SkillCard from '../components/SkillCard';
import { Link } from 'react-router-dom';

function AnalysisPage() {
  const storedData = JSON.parse(localStorage.getItem('analysisData'));

  const extractedSkills = storedData?.extractedSkills || [];
  const requiredSkills = storedData?.requiredSkills || [];
  const missingSkills = storedData?.missingSkills || [];
  const matchScore = storedData?.matchScore || 0;

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h2>NLP Processing & Skill Gap Analysis</h2>
        <p>
          The system analyzes the uploaded resume, extracts candidate skills,
          compares them with the job description, and identifies the missing skills.
        </p>

        <Loader />

        <div className="skills-grid">
          <SkillCard title="Extracted Skills" skills={extractedSkills} />
          <SkillCard title="Required Skills" skills={requiredSkills} />
          <SkillCard title="Missing Skills" skills={missingSkills} />
        </div>

        <div className="match-score-box">
          <h3>Match Score: {matchScore}%</h3>
        </div>

        <Link to="/ranking">
          <button>View Candidate Ranking</button>
        </Link>
      </div>
    </div>
  );
}

export default AnalysisPage;