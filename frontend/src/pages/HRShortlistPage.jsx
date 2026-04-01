import Navbar from '../components/Navbar';

function HRShortlistPage() {
  const storedData = JSON.parse(localStorage.getItem('hrShortlistData'));
  const candidates = storedData?.rankedCandidates || [];
  const shortlistCount = parseInt(storedData?.shortlistCount || candidates.length, 10);

  const shortlistedCandidates = candidates.slice(0, shortlistCount);

  const getScoreColor = (score) => {
    if (score >= 80) return '#16a34a';
    if (score >= 50) return '#f59e0b';
    return '#dc2626';
  };

  const handleDownloadReport = () => {
    const reportContent = `
AI Resume Screening Platform - Shortlist Report

Final Shortlisted Candidates:
${shortlistedCandidates
  .map(
    (candidate, index) =>
      `${index + 1}. ${candidate.name} - ${candidate.score}%`
  )
  .join('\n')}

Top Candidate:
${shortlistedCandidates.length > 0 ? shortlistedCandidates[0].name : 'N/A'}

Total Uploaded Candidates: ${candidates.length}
Shortlisted Candidates: ${shortlistedCandidates.length}

Hiring Recommendation:
${
  shortlistedCandidates.length > 0
    ? 'Proceed with interview scheduling for shortlisted candidates.'
    : 'No suitable candidates found.'
}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'shortlist_report.txt';
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h2>Shortlisted Candidates</h2>
        <p>
          The following candidates have been shortlisted for interview based on
          resume-job match score.
        </p>

        <div className="dashboard-card large-card">
          <h3>Final Shortlist</h3>
          <table className="candidate-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Candidate Name</th>
                <th>Match Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {shortlistedCandidates.map((candidate, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{candidate.name}</td>
                  <td style={{ color: getScoreColor(candidate.score), fontWeight: 'bold' }}>
                    {candidate.score}%
                  </td>
                  <td>
                    <span className="shortlist-badge">Shortlisted</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {shortlistedCandidates.length > 0 && (
          <div className="dashboard-card large-card">
            <h3>Top Candidate Recommendation</h3>
            <p>
              <strong>{shortlistedCandidates[0].name}</strong> is currently the
              best-matched candidate based on the uploaded resumes and target job description.
            </p>
            <p>
              <strong>Top Score:</strong>{' '}
              <span style={{ color: getScoreColor(shortlistedCandidates[0].score), fontWeight: 'bold' }}>
                {shortlistedCandidates[0].score}%
              </span>
            </p>
          </div>
        )}

        <div className="dashboard-card large-card">
          <h3>Interview Ready List</h3>
          <ul>
            {shortlistedCandidates.length > 0 ? (
              shortlistedCandidates.map((candidate, index) => (
                <li key={index}>
                  <strong>{candidate.name}</strong> is ready to proceed for the next stage of interview
                  with a match score of <strong>{candidate.score}%</strong>.
                </li>
              ))
            ) : (
              <li>No candidates available for interview.</li>
            )}
          </ul>
        </div>

        <div className="dashboard-card large-card">
          <h3>Final Hiring Summary</h3>
          <p><strong>Total Resumes Uploaded:</strong> {candidates.length}</p>
          <p><strong>Shortlisted Candidates:</strong> {shortlistedCandidates.length}</p>
          <p>
            <strong>Best Candidate:</strong>{' '}
            {shortlistedCandidates.length > 0 ? shortlistedCandidates[0].name : 'N/A'}
          </p>
          <p>
            <strong>Hiring Recommendation:</strong>{' '}
            {shortlistedCandidates.length > 0
              ? 'Proceed with interview scheduling for the shortlisted candidates.'
              : 'No suitable candidates found for this job role.'}
          </p>
        </div>

        <button onClick={handleDownloadReport}>Download Shortlist Report</button>
      </div>
    </div>
  );
}

export default HRShortlistPage;