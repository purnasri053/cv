import Navbar from '../components/Navbar';
import SkillCard from '../components/SkillCard';

function AnalysisPage() {
  const storedData =
    JSON.parse(localStorage.getItem('candidateAnalysisData')) ||
    JSON.parse(localStorage.getItem('hrShortlistData'));

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

        <div className="skills-grid">
          <SkillCard title="Extracted Skills" skills={extractedSkills} />
          <SkillCard title="Required Skills" skills={requiredSkills} />
          <SkillCard title="Missing Skills" skills={missingSkills} />
        </div>

        <div className="match-score-box">
          <h3>Match Score: {matchScore}%</h3>
        </div>
      </div>
    </div>
  );
}

export default AnalysisPage;
