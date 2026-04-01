import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { FaUpload, FaFileAlt, FaBriefcase, FaRocket, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import API from '../services/api';

function CandidateDashboardPage() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const candidateUser = JSON.parse(localStorage.getItem('candidateUser'));
  if (!candidateUser) return <Navigate to="/candidate-login" replace />;

  const handleFile = (file) => {
    if (file && (file.name.endsWith('.pdf') || file.name.endsWith('.docx'))) {
      setResumeFile(file);
      setError('');
    } else {
      setError('Only PDF or DOCX files are supported.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleAnalyze = async () => {
    setError('');
    if (!resumeFile) { setError('Please upload your resume first.'); return; }
    if (!jobDescription.trim()) { setError('Please enter the job description.'); return; }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobDescription', jobDescription);
      const response = await API.post('/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      localStorage.setItem('candidateAnalysisData', JSON.stringify(response.data));
      navigate('/candidate-analysis');
    } catch (err) {
      setError('Could not reach the backend. Make sure Flask is running.');
    } finally {
      setLoading(false);
    }
  };

  const initials = candidateUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="dash-page">
      <Navbar />

      <div className="dash-layout">

        {/* Sidebar */}
        <aside className="dash-sidebar">
          <div className="dash-avatar">{initials}</div>
          <div className="dash-user-name">{candidateUser.full_name}</div>
          <div className="dash-user-role">Candidate</div>
          <div className="dash-user-email">{candidateUser.email}</div>

          <div className="dash-sidebar-steps">
            <div className="dash-step active">
              <div className="dash-step-dot">1</div>
              <span>Upload Resume</span>
            </div>
            <div className="dash-step-line" />
            <div className={`dash-step ${resumeFile ? 'active' : ''}`}>
              <div className="dash-step-dot">2</div>
              <span>Job Description</span>
            </div>
            <div className="dash-step-line" />
            <div className="dash-step">
              <div className="dash-step-dot">3</div>
              <span>View Analysis</span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="dash-main">

          {/* Header */}
          <div className="dash-header">
            <div>
              <h1>Welcome back, {candidateUser.full_name.split(' ')[0]} 👋</h1>
              <p>Upload your resume and a job description to get your match score and skill gap analysis.</p>
            </div>
          </div>

          {error && (
            <div className="dash-error">
              <FaTimesCircle /> {error}
            </div>
          )}

          {/* Upload Zone */}
          <div className="dash-section">
            <div className="dash-section-label">
              <FaUpload className="dash-section-icon" />
              <span>Step 1 — Upload Your Resume</span>
            </div>

            <div
              className={`drop-zone ${dragOver ? 'drag-active' : ''} ${resumeFile ? 'drop-zone-done' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('resume-input').click()}
            >
              <input
                id="resume-input"
                type="file"
                accept=".pdf,.docx"
                style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {resumeFile ? (
                <div className="drop-zone-success">
                  <FaCheckCircle className="drop-check" />
                  <div>
                    <div className="drop-filename">{resumeFile.name}</div>
                    <div className="drop-filesize">{(resumeFile.size / 1024).toFixed(1)} KB — ready to analyze</div>
                  </div>
                  <button className="drop-remove" onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}>
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="drop-icon-wrap"><FaFileAlt /></div>
                  <div className="drop-title">Drag & drop your resume here</div>
                  <div className="drop-sub">or click to browse — PDF or DOCX only</div>
                </>
              )}
            </div>
          </div>

          {/* Job Description */}
          <div className="dash-section">
            <div className="dash-section-label">
              <FaBriefcase className="dash-section-icon" />
              <span>Step 2 — Paste Job Description</span>
            </div>
            <textarea
              className="dash-textarea"
              rows={9}
              placeholder="Paste the full job description here — required skills, responsibilities, qualifications..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <div className="dash-char-count">{jobDescription.length} characters</div>
          </div>

          {/* Analyze Button */}
          <button className="dash-analyze-btn" onClick={handleAnalyze} disabled={loading}>
            <FaRocket />
            {loading ? 'Analyzing your resume...' : 'Analyze My Resume'}
          </button>

        </main>
      </div>
    </div>
  );
}

export default CandidateDashboardPage;
