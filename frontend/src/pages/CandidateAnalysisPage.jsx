import Navbar from '../components/Navbar';
import SkillCard from '../components/SkillCard';

function CandidateAnalysisPage() {
  const storedData = JSON.parse(localStorage.getItem('candidateAnalysisData'));

  const extractedSkills = storedData?.extractedSkills || [];
  const requiredSkills = storedData?.requiredSkills || [];
  const missingSkills = storedData?.missingSkills || [];
  const matchScore = storedData?.matchScore || 0;
  const candidateName = storedData?.candidateName || 'Candidate';

  const getScoreColor = (score) => {
    if (score >= 80) return '#16a34a';
    if (score >= 50) return '#f59e0b';
    return '#dc2626';
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h2>Candidate Resume Analysis</h2>
        <p>
          This page shows how well your resume matches the selected role and
          what skills you should improve to increase your chances of selection.
        </p>

        <div className="dashboard-card large-card">
          <h3>Candidate Summary</h3>
          <p><strong>Name:</strong> {candidateName}</p>
          <p>
            <strong>Match Score:</strong>{' '}
            <span style={{ color: getScoreColor(matchScore), fontWeight: 'bold' }}>
              {matchScore}%
            </span>
          </p>
          <p>
            <strong>Resume Status:</strong>{' '}
            {matchScore >= 80
              ? 'Highly Suitable'
              : matchScore >= 50
              ? 'Moderately Suitable'
              : 'Needs Improvement'}
          </p>
        </div>

        <div className="skills-grid">
          <SkillCard title="Extracted Skills" skills={extractedSkills} />
          <SkillCard title="Required Skills" skills={requiredSkills} />
          <SkillCard title="Missing Skills" skills={missingSkills} />
        </div>

        <div className="dashboard-card large-card">
          <h3>Improvement Suggestions</h3>
          <ul>
            {missingSkills.length > 0 ? (
              missingSkills.map((skill, index) => (
                <li key={index}>
                  Improve your knowledge in <strong>{skill}</strong> and reflect it
                  in your resume with projects or practical experience.
                </li>
              ))
            ) : (
              <li>Your resume is well aligned with the selected role.</li>
            )}
          </ul>
        </div>

        <div className="dashboard-card large-card">
          <h3>Resume Recommendation</h3>
          <p>
            {matchScore >= 80 &&
              'Your resume is strongly aligned with the selected role. You can confidently apply for this position.'}
            {matchScore >= 50 && matchScore < 80 &&
              'Your resume is moderately aligned with the role. Improve the missing skills and add more relevant project experience.'}
            {matchScore < 50 &&
              'Your resume needs significant improvement for this role. Focus on the missing skills and update your resume before applying.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CandidateAnalysisPage;