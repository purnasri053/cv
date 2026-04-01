import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from 'recharts';
import Navbar from '../components/Navbar';

function DashboardPage() {
  const storedData = JSON.parse(localStorage.getItem('analysisData'));
  const candidates = storedData?.rankedCandidates || [];
  const matchScore = storedData?.matchScore || 0;
  const missingSkills = storedData?.missingSkills || [];

  const chartCandidates = candidates.map((candidate) => ({
    ...candidate,
    shortName:
      candidate.name.length > 12
        ? candidate.name.substring(0, 12) + '...'
        : candidate.name
  }));

  const pieData = [
    { name: 'Matched', value: matchScore },
    { name: 'Skill Gap', value: 100 - matchScore }
  ];

  const pieColors = ['#2563eb', '#93c5fd'];

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h2>User Dashboard & Feedback</h2>
        <p>
          This dashboard provides summary insights, top candidate information,
          and skill gap recommendations based on the resume screening analysis.
        </p>

        <div className="dashboard-grid">
          <div className="dashboard-card stat-card">
            <h3>Total Candidates Analyzed</h3>
            <p>{candidates.length}</p>
          </div>

          <div className="dashboard-card stat-card">
            <h3>Top Candidate Score</h3>
            <p>{candidates.length > 0 ? `${candidates[0].score}%` : '0%'}</p>
          </div>

          <div className="dashboard-card stat-card">
            <h3>Most Missing Skill</h3>
            <p>{missingSkills.length > 0 ? missingSkills[0] : 'N/A'}</p>
          </div>
        </div>

        <div className="dashboard-card large-card">
          <h3>Insights & Reports</h3>
          <p><strong>Overall Match Score:</strong> {matchScore}%</p>
          <p><strong>Top Candidate:</strong> {candidates.length > 0 ? candidates[0].name : 'N/A'}</p>
          <p>
            <strong>Missing Skills Identified:</strong>{' '}
            {missingSkills.length > 0 ? missingSkills.join(', ') : 'None'}
          </p>
        </div>

        <div className="dashboard-card large-card">
          <h3>Skill Gap Recommendations</h3>
          <ul>
            {missingSkills.length > 0 ? (
              missingSkills.map((skill, index) => (
                <li key={index}>Improve knowledge in {skill}</li>
              ))
            ) : (
              <li>No missing skills identified</li>
            )}
          </ul>
        </div>

        <div className="chart-grid">
          <div className="dashboard-card large-card chart-card">
            <h3>Candidate Score Chart</h3>

            {chartCandidates.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={chartCandidates}
                  margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="shortName" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar
                    dataKey="score"
                    fill="#2563eb"
                    radius={[8, 8, 0, 0]}
                    barSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No candidate data available for chart.</p>
            )}
          </div>

          <div className="dashboard-card large-card chart-card">
            <h3>Match vs Skill Gap Overview</h3>

            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={4}
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card large-card">
          <h3>Feedback</h3>
          <textarea
            className="text-area"
            rows="6"
            placeholder="Enter recruiter or system feedback here..."
          ></textarea>
          <button>Submit Feedback</button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;