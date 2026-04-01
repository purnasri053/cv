import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  FaUpload, FaFileAlt, FaBriefcase, FaRocket, FaTimesCircle, FaCheckCircle,
  FaUser, FaBook, FaCalendarAlt, FaQuestionCircle, FaStar, FaBell, FaTimes
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import API from '../services/api';

const COURSES = [
  { title: 'Python for Beginners', platform: 'Coursera', url: 'https://www.coursera.org/learn/python', tag: 'Free' },
  { title: 'Full Stack Web Dev', platform: 'Udemy', url: 'https://www.udemy.com/course/the-web-developer-bootcamp/', tag: 'Popular' },
  { title: 'Machine Learning', platform: 'Coursera', url: 'https://www.coursera.org/learn/machine-learning', tag: 'Top Rated' },
  { title: 'AWS Cloud Practitioner', platform: 'AWS', url: 'https://aws.amazon.com/training/', tag: 'Free' },
  { title: 'React - The Complete Guide', platform: 'Udemy', url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/', tag: 'Popular' },
  { title: 'Data Science with Python', platform: 'Kaggle', url: 'https://www.kaggle.com/learn', tag: 'Free' },
];

function CandidateDashboardPage() {
  const [resumeFile, setResumeFile]     = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [dragOver, setDragOver]         = useState(false);
  const [activeTab, setActiveTab]       = useState('analyze');
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Upload your resume to get started!', time: 'Just now', read: false },
    { id: 2, text: 'New job openings match your profile', time: '1h ago', read: false },
    { id: 3, text: 'Complete your profile for better matches', time: '2h ago', read: true },
  ]);
  const [showNotif, setShowNotif]       = useState(false);
  const navigate = useNavigate();

  const candidateUser = JSON.parse(localStorage.getItem('candidateUser'));
  if (!candidateUser) return <Navigate to="/candidate-login" replace />;

  const unreadCount = notifications.filter(n => !n.read).length;
  const initials = candidateUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleFile = (file) => {
    if (file && (file.name.endsWith('.pdf') || file.name.endsWith('.docx'))) {
      setResumeFile(file); setError('');
    } else { setError('Only PDF or DOCX files are supported.'); }
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
      const response = await API.post('/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      localStorage.setItem('candidateAnalysisData', JSON.stringify(response.data));
      navigate('/candidate-analysis');
    } catch { setError('Could not reach the backend.'); }
    finally { setLoading(false); }
  };

  const tabs = [
    { id: 'analyze',   icon: <FaRocket />,       label: 'Analyze' },
    { id: 'courses',   icon: <FaBook />,          label: 'Courses' },
    { id: 'profile',   icon: <FaUser />,          label: 'Profile' },
    { id: 'calendar',  icon: <FaCalendarAlt />,   label: 'Calendar' },
    { id: 'help',      icon: <FaQuestionCircle />, label: 'Help' },
  ];

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
          <div className="dash-sidebar-steps" style={{ marginTop: 32 }}>
            {tabs.map(t => (
              <div key={t.id} className={`dash-nav-item ${activeTab === t.id ? 'dash-nav-active' : ''}`}
                onClick={() => setActiveTab(t.id)}>
                <span className="dash-nav-icon">{t.icon}</span>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="dash-main">

          {/* Header with notification bell */}
          <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1>Welcome back, {candidateUser.full_name.split(' ')[0]} 👋</h1>
              <p>Your AI-powered career assistant</p>
            </div>
            <div style={{ position: 'relative' }}>
              <button className="notif-bell" onClick={() => setShowNotif(s => !s)}>
                <FaBell />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </button>
              {showNotif && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span>Notifications</span>
                    <button onClick={() => setShowNotif(false)}><FaTimes /></button>
                  </div>
                  {notifications.map(n => (
                    <div key={n.id} className={`notif-item ${!n.read ? 'notif-unread' : ''}`}
                      onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}>
                      <div className="notif-text">{n.text}</div>
                      <div className="notif-time">{n.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && <div className="dash-error"><FaTimesCircle /> {error}</div>}

          {/* ── ANALYZE TAB ── */}
          {activeTab === 'analyze' && (
            <>
              <div className="dash-section">
                <div className="dash-section-label"><FaUpload className="dash-section-icon" /><span>Step 1 — Upload Your Resume</span></div>
                <div className={`drop-zone ${dragOver ? 'drag-active' : ''} ${resumeFile ? 'drop-zone-done' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                  onClick={() => document.getElementById('resume-input').click()}>
                  <input id="resume-input" type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                  {resumeFile ? (
                    <div className="drop-zone-success">
                      <FaCheckCircle className="drop-check" />
                      <div><div className="drop-filename">{resumeFile.name}</div><div className="drop-filesize">{(resumeFile.size/1024).toFixed(1)} KB</div></div>
                      <button className="drop-remove" onClick={e => { e.stopPropagation(); setResumeFile(null); }}>Remove</button>
                    </div>
                  ) : (
                    <><div className="drop-icon-wrap"><FaFileAlt /></div><div className="drop-title">Drag & drop your resume here</div><div className="drop-sub">or click to browse — PDF or DOCX only</div></>
                  )}
                </div>
              </div>
              <div className="dash-section">
                <div className="dash-section-label"><FaBriefcase className="dash-section-icon" /><span>Step 2 — Job Role or Description</span></div>
                <textarea className="dash-textarea" rows={7}
                  placeholder="Type a job role (e.g. 'software developer', 'data scientist') or paste a full job description..."
                  value={jobDescription} onChange={e => setJobDescription(e.target.value)} />
                <div className="dash-char-count">{jobDescription.length} characters</div>
              </div>
              <button className="dash-analyze-btn" onClick={handleAnalyze} disabled={loading}>
                <FaRocket />{loading ? 'Analyzing...' : 'Analyze My Resume'}
              </button>
            </>
          )}

          {/* ── COURSES TAB ── */}
          {activeTab === 'courses' && (
            <div>
              <div className="dash-section-label" style={{ marginBottom: 20 }}><FaBook className="dash-section-icon" /><span>Recommended Courses</span></div>
              <div className="courses-grid">
                {COURSES.map((c, i) => (
                  <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className="course-card">
                    <div className="course-tag">{c.tag}</div>
                    <div className="course-title">{c.title}</div>
                    <div className="course-platform">{c.platform}</div>
                    <div className="course-link">Start Learning →</div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <div className="dash-section">
              <div className="dash-section-label"><FaUser className="dash-section-icon" /><span>My Profile</span></div>
              <div className="profile-card">
                <div className="profile-avatar">{initials}</div>
                <div className="profile-info">
                  <div className="profile-name">{candidateUser.full_name}</div>
                  <div className="profile-email">{candidateUser.email}</div>
                  <div className="profile-role">Candidate</div>
                </div>
              </div>
              <div style={{ marginTop: 20, color: '#64748b', fontSize: 14 }}>
                <p>📊 Resume analyses: {localStorage.getItem('candidateAnalysisData') ? '1' : '0'}</p>
                <p style={{ marginTop: 8 }}>🎯 Last analysis score: {JSON.parse(localStorage.getItem('candidateAnalysisData') || '{}')?.matchScore || 'N/A'}%</p>
              </div>
            </div>
          )}

          {/* ── CALENDAR TAB ── */}
          {activeTab === 'calendar' && (
            <div className="dash-section">
              <div className="dash-section-label"><FaCalendarAlt className="dash-section-icon" /><span>Job Application Reminders</span></div>
              <div className="calendar-empty">
                <FaCalendarAlt style={{ fontSize: 40, color: '#334155', marginBottom: 12 }} />
                <p>No reminders set yet.</p>
                <p style={{ fontSize: 13, color: '#475569', marginTop: 8 }}>Set reminders for job application deadlines and interview schedules.</p>
                <button className="dash-analyze-btn" style={{ marginTop: 20, padding: '12px 24px', width: 'auto' }}
                  onClick={() => {
                    const title = prompt('Reminder title (e.g. Apply to Google):');
                    if (title) {
                      const newNotif = { id: Date.now(), text: `⏰ Reminder: ${title}`, time: 'Just now', read: false };
                      setNotifications(prev => [newNotif, ...prev]);
                      setActiveTab('analyze');
                      alert('Reminder added to notifications!');
                    }
                  }}>
                  + Add Reminder
                </button>
              </div>
            </div>
          )}

          {/* ── HELP TAB ── */}
          {activeTab === 'help' && (
            <div className="dash-section">
              <div className="dash-section-label"><FaQuestionCircle className="dash-section-icon" /><span>Help & Feedback</span></div>
              <div className="help-list">
                {[
                  { q: 'How does resume analysis work?', a: 'Upload your resume and enter a job role or description. CVScanner extracts your skills and compares them with the required skills for that role.' },
                  { q: 'What file formats are supported?', a: 'PDF and DOCX files are supported for resume upload.' },
                  { q: 'How is the match score calculated?', a: 'Match score = (matched skills / required skills) × 100. A score of 80%+ means you are highly suitable.' },
                  { q: 'Can I analyze multiple job roles?', a: 'Yes! Go back to the Analyze tab and upload your resume again with a different job description.' },
                ].map((item, i) => (
                  <div key={i} className="help-item">
                    <div className="help-q">❓ {item.q}</div>
                    <div className="help-a">{item.a}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <div className="dash-section-label"><FaStar className="dash-section-icon" /><span>Send Feedback</span></div>
                <textarea className="dash-textarea" rows={4} placeholder="Tell us how we can improve CVScanner..." />
                <button className="dash-analyze-btn" style={{ marginTop: 12, padding: '12px 24px', width: 'auto' }}
                  onClick={() => alert('Thank you for your feedback! 🙏')}>
                  Submit Feedback
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default CandidateDashboardPage;
