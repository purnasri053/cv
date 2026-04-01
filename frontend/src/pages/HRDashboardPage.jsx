import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { FaUpload, FaFileAlt, FaBriefcase, FaUsers, FaTimesCircle, FaCheckCircle, FaTrash } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import API from '../services/api';

function HRDashboardPage() {
  const [resumeFiles, setResumeFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [shortlistCount, setShortlistCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const hrUser = JSON.parse(localStorage.getItem('hrUser'));
  if (!hrUser) return <Navigate to="/hr-login" replace />;

  const handleFiles = (newFiles) => {
    const valid = Array.from(newFiles).filter(f => f.name.endsWith('.pdf') || f.name.endsWith('.docx'));
    setResumeFiles(prev => {
      const existing = prev.map(f => f.name);
      return [...prev, ...valid.filter(f => !existing.includes(f.name))];
    });
    setError('');
  };

  const handleAnalyze = async () => {
    setError('');
    if (resumeFiles.length === 0) { setError('Please upload at least one resume.'); return; }
    if (!jobDescription.trim()) { setError('Please enter the job description.'); return; }
    try {
      setLoading(true);
      const formData = new FormData();
      resumeFiles.forEach(f => formData.append('resumes', f));
      formData.append('jobDescription', jobDescription);
      formData.append('shortlistCount', shortlistCount);
      const response = await API.post('/analyze-multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      localStorage.setItem('hrShortlistData', JSON.stringify(response.data));
      navigate('/hr-shortlist');
    } catch (err) {
      setError('Could not reach the backend. Make sure Flask is running.');
    } finally {
      setLoading(false);
    }
  };

  const initials = hrUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="dash-page">
      <Navbar />
      <div className="dash-layout">

        {/* Sidebar */}
        <aside className="dash-sidebar">
          <div className="dash-avatar dash-avatar-hr">{initials}</div>
          <div className="dash-user-name">{hrUser.full_name}</div>
          <div className="dash-user-role dash-role-hr">HR Professional</div>
          <div className="dash-user-email">{hrUser.email}</div>

          <div className="dash-sidebar-steps">
            <div className="dash-step active">
              <div className="dash-step-dot">1</div>
              <span>Upload Resumes</span>
            </div>
            <div className="dash-step-line" />
            <div className={`dash-step ${resumeFiles.length > 0 ? 'active' : ''}`}>
              <div className="dash-step-dot">2</div>
              <span>Job Description</span>
            </div>
            <div className="dash-step-line" />
            <div className="dash-step">
              <div className="dash-step-dot">3</div>
              <span>Shortlist Results</span>
            </div>
          </div>

          {resumeFiles.length > 0 && (
            <div className="dash-sidebar-count">
              <span>{resumeFiles.length}</span>
              <p>resume{resumeFiles.length > 1 ? 's' : ''} ready</p>
            </div>
          )}
        </aside>

        {/* Main */}
        <main className="dash-main">
          <div className="dash-header">
            <div>
              <h1>Welcome back, {hrUser.full_name.split(' ')[0]} 👋</h1>
              <p>Upload candidate resumes, set your job requirements, and let CVScanner rank the best fits.</p>
            </div>
          </div>

          {error && <div className="dash-error"><FaTimesCircle /> {error}</div>}

          {/* Upload Zone */}
          <div className="dash-section">
            <div className="dash-section-label">
              <FaUpload className="dash-section-icon" />
              <span>Step 1 — Upload Candidate Resumes</span>
            </div>

            <div
              className={`drop-zone ${dragOver ? 'drag-active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => document.getElementById('hr-resume-input').click()}
            >
              <input id="hr-resume-input" type="file" accept=".pdf,.docx" multiple
                style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
              <div className="drop-icon-wrap"><FaFileAlt /></div>
              <div className="drop-title">Drag & drop resumes here</div>
              <div className="drop-sub">or click to browse — PDF or DOCX, multiple files supported</div>
            </div>

            {resumeFiles.length > 0 && (
              <div className="hr-file-list">
                {resumeFiles.map((file, i) => (
                  <div className="hr-file-item" key={i}>
                    <FaCheckCircle className="hr-file-check" />
                    <div className="hr-file-info">
                      <span className="hr-file-name">{file.name}</span>
                      <span className="hr-file-size">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <button className="hr-file-remove" onClick={() => setResumeFiles(prev => prev.filter((_, idx) => idx !== i))}>
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shortlist Count */}
          <div className="dash-section">
            <div className="dash-section-label">
              <FaUsers className="dash-section-icon" />
              <span>Step 2 — Shortlist Settings</span>
            </div>
            <label className="dash-input-label">How many top candidates to shortlist?</label>
            <input
              type="number"
              className="dash-number-input"
              value={shortlistCount}
              min={1}
              onChange={e => setShortlistCount(e.target.value)}
            />
          </div>

          {/* Job Description */}
          <div className="dash-section">
            <div className="dash-section-label">
              <FaBriefcase className="dash-section-icon" />
              <span>Step 3 — Paste Job Description</span>
            </div>
            <textarea
              className="dash-textarea"
              rows={9}
              placeholder="Paste the full job description here — required skills, responsibilities, qualifications..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
            />
            <div className="dash-char-count">{jobDescription.length} characters</div>
          </div>

          <button className="dash-analyze-btn" onClick={handleAnalyze} disabled={loading}>
            <FaUsers />
            {loading ? 'Analyzing & Shortlisting...' : 'Shortlist Candidates'}
          </button>
        </main>
      </div>
    </div>
  );
}

export default HRDashboardPage;
