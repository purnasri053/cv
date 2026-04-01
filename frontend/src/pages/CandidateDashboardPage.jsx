import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  FaUpload, FaFileAlt, FaBriefcase, FaRocket, FaTimesCircle, FaCheckCircle,
  FaUser, FaBook, FaCalendarAlt, FaQuestionCircle, FaStar, FaBell, FaTimes,
  FaTrash, FaBookmark, FaHome
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import API from '../services/api';

const COURSES = [
  { id: 1, title: 'Python for Beginners', platform: 'Coursera', url: 'https://www.coursera.org/learn/python', tag: 'Free' },
  { id: 2, title: 'Full Stack Web Dev', platform: 'Udemy', url: 'https://www.udemy.com/course/the-web-developer-bootcamp/', tag: 'Popular' },
  { id: 3, title: 'Machine Learning', platform: 'Coursera', url: 'https://www.coursera.org/learn/machine-learning', tag: 'Top Rated' },
  { id: 4, title: 'AWS Cloud Practitioner', platform: 'AWS', url: 'https://aws.amazon.com/training/', tag: 'Free' },
  { id: 5, title: 'React - The Complete Guide', platform: 'Udemy', url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/', tag: 'Popular' },
  { id: 6, title: 'Data Science with Python', platform: 'Kaggle', url: 'https://www.kaggle.com/learn', tag: 'Free' },
];

const FAQ = [
  { q: 'How does resume analysis work?', a: 'Upload your resume and enter a job role or description. CVScanner extracts your skills and compares them with the required skills for that role.' },
  { q: 'What file formats are supported?', a: 'PDF and DOCX files are supported for resume upload.' },
  { q: 'How is the match score calculated?', a: 'Match score = (matched skills / required skills) × 100. A score of 80%+ means you are highly suitable.' },
  { q: 'Can I analyze multiple job roles?', a: 'Yes! Go back to the Analyze tab and upload your resume again with a different job description.' },
];

function loadLS(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function saveLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function CandidateDashboardPage() {
  const [resumeFile, setResumeFile]         = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [dragOver, setDragOver]             = useState(false);
  const [activeTab, setActiveTab]           = useState('analyze');

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Upload your resume to get started!', time: 'Just now', read: false },
    { id: 2, text: 'New job openings match your profile', time: '1h ago', read: false },
    { id: 3, text: 'Complete your profile for better matches', time: '2h ago', read: true },
  ]);
  const [showNotif, setShowNotif] = useState(false);

  const [savedCourses, setSavedCourses]     = useState(() => loadLS('savedCourses', []));
  const [reminders, setReminders]           = useState(() => loadLS('calendarReminders', []));
  const [reminderTitle, setReminderTitle]   = useState('');
  const [reminderDate, setReminderDate]     = useState('');
  const [tomorrowBanners, setTomorrowBanners] = useState([]);

  const [feedbackText, setFeedbackText]     = useState('');

  const navigate = useNavigate();

  const candidateUser = loadLS('candidateUser', null);
  if (!candidateUser) return <Navigate to="/candidate-login" replace />;

  const unreadCount = notifications.filter(n => !n.read).length;
  const initials = candidateUser.full_name
    ? candidateUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  // Check tomorrow reminders on mount
  useEffect(() => {
    const stored = loadLS('calendarReminders', []);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const due = stored.filter(r => r.date === tomorrowStr && !r.notified);
    if (due.length > 0) {
      setTomorrowBanners(due.map(r => r.title));
      const updated = stored.map(r =>
        r.date === tomorrowStr ? { ...r, notified: true } : r
      );
      setReminders(updated);
      saveLS('calendarReminders', updated);
    }
  }, []);

  const handleFile = (file) => {
    if (file && (file.name.endsWith('.pdf') || file.name.endsWith('.docx'))) {
      setResumeFile(file);
      setError('');
    } else {
      setError('Only PDF or DOCX files are supported.');
    }
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
      saveLS('candidateAnalysisData', response.data);
      navigate('/candidate-analysis');
    } catch {
      setError('Could not reach the backend.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveCourse = (course) => {
    const already = savedCourses.find(c => c.id === course.id);
    const updated = already
      ? savedCourses.filter(c => c.id !== course.id)
      : [...savedCourses, course];
    setSavedCourses(updated);
    saveLS('savedCourses', updated);
  };

  const removeSavedCourse = (id) => {
    const updated = savedCourses.filter(c => c.id !== id);
    setSavedCourses(updated);
    saveLS('savedCourses', updated);
  };

  const addReminder = () => {
    if (!reminderTitle.trim() || !reminderDate) return;
    const newReminder = {
      id: Date.now(),
      title: reminderTitle.trim(),
      date: reminderDate,
      notified: false,
    };
    const updated = [...reminders, newReminder];
    setReminders(updated);
    saveLS('calendarReminders', updated);
    setReminderTitle('');
    setReminderDate('');
  };

  const deleteReminder = (id) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    saveLS('calendarReminders', updated);
  };

  const markNotifRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const tabs = [
    { id: 'analyze',  icon: <FaRocket />,        label: 'Analyze' },
    { id: 'courses',  icon: <FaBook />,           label: 'Courses' },
    { id: 'profile',  icon: <FaUser />,           label: 'Profile' },
    { id: 'calendar', icon: <FaCalendarAlt />,    label: 'Calendar' },
    { id: 'help',     icon: <FaQuestionCircle />, label: 'Help' },
  ];

  return (
    <div className="dash-page">
      <Navbar />

      {/* Tomorrow reminder banners */}
      {tomorrowBanners.map((title, i) => (
        <div key={i} className="reminder-badge">
          ⏰ Reminder tomorrow: {title}
          <button onClick={() => setTomorrowBanners(prev => prev.filter((_, j) => j !== i))}>
            <FaTimes />
          </button>
        </div>
      ))}

      <div className="dash-layout">

        {/* ── Sidebar — user info only, no tabs ── */}
        <aside className="dash-sidebar">
          <div className="dash-avatar">{initials}</div>
          <div className="dash-user-name">{candidateUser.full_name}</div>
          <div className="dash-user-role">Candidate</div>
          <div className="dash-user-email">{candidateUser.email}</div>
        </aside>

        {/* ── Main Content ── */}
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
                      onClick={() => markNotifRead(n.id)}>
                      <div className="notif-text">{n.text}</div>
                      <div className="notif-time">{n.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Horizontal Tab Bar ── */}
          <div className="dash-top-tabs">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`dash-top-tab ${activeTab === t.id ? 'dash-top-tab-active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                <span className="dash-top-tab-icon">{t.icon}</span>
                <span>{t.label}</span>
                {t.id === 'courses' && savedCourses.length > 0 && (
                  <span className="dash-tab-badge">{savedCourses.length}</span>
                )}
              </button>
            ))}
          </div>

          {error && <div className="dash-error"><FaTimesCircle /> {error}</div>}

          {/* ── ANALYZE TAB ── */}
          {activeTab === 'analyze' && (
            <div>
              <div className="analyze-grid">
                {/* Upload */}
                <div className="dash-section">
                  <div className="dash-section-label">
                    <FaUpload className="dash-section-icon" />
                    <span>Step 1 — Upload Your Resume</span>
                  </div>
                  <div
                    className={`drop-zone ${dragOver ? 'drag-active' : ''} ${resumeFile ? 'drop-zone-done' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => document.getElementById('resume-input').click()}
                  >
                    <input
                      id="resume-input"
                      type="file"
                      accept=".pdf,.docx"
                      style={{ display: 'none' }}
                      onChange={e => handleFile(e.target.files[0])}
                    />
                    {resumeFile ? (
                      <div className="drop-zone-success">
                        <FaCheckCircle className="drop-check" />
                        <div>
                          <div className="drop-filename">{resumeFile.name}</div>
                          <div className="drop-filesize">{(resumeFile.size / 1024).toFixed(1)} KB</div>
                        </div>
                        <button
                          className="drop-remove"
                          onClick={e => { e.stopPropagation(); setResumeFile(null); }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="drop-icon-wrap"><FaFileAlt /></div>
                        <div className="drop-title">Drag &amp; drop your resume here</div>
                        <div className="drop-sub">or click to browse — PDF or DOCX only</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Job Description */}
                <div className="dash-section">
                  <div className="dash-section-label">
                    <FaBriefcase className="dash-section-icon" />
                    <span>Step 2 — Job Role or Description</span>
                  </div>
                  <textarea
                    className="dash-textarea"
                    rows={7}
                    placeholder="Type a job role (e.g. 'software developer') or paste a full job description..."
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                  />
                  <div className="dash-char-count">{jobDescription.length} characters</div>
                </div>
              </div>

              <button className="dash-analyze-btn" onClick={handleAnalyze} disabled={loading}>
                <FaRocket />
                {loading ? 'Analyzing...' : 'Analyze My Resume'}
              </button>
            </div>
          )}

          {/* ── COURSES TAB ── */}
          {activeTab === 'courses' && (
            <div>
              <div className="dash-section-label" style={{ marginBottom: 20 }}>
                <FaBook className="dash-section-icon" />
                <span>Recommended Courses</span>
                {savedCourses.length > 0 && (
                  <span className="notif-badge" style={{ position: 'static', marginLeft: 8 }}>
                    {savedCourses.length} saved
                  </span>
                )}
              </div>
              <div className="courses-grid">
                {COURSES.map(c => {
                  const isSaved = savedCourses.some(s => s.id === c.id);
                  return (
                    <div key={c.id} className="course-card" style={{ position: 'relative' }}>
                      <div className="course-tag">{c.tag}</div>
                      <div className="course-title">{c.title}</div>
                      <div className="course-platform">{c.platform}</div>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="course-link"
                        onClick={e => e.stopPropagation()}
                      >
                        Start Learning →
                      </a>
                      <button
                        className={`course-save-btn ${isSaved ? 'course-save-btn--saved' : ''}`}
                        onClick={() => toggleSaveCourse(c)}
                        title={isSaved ? 'Remove from saved' : 'Save course'}
                      >
                        <FaBookmark />
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <div>
              <div className="dash-section">
                <div className="dash-section-label">
                  <FaUser className="dash-section-icon" />
                  <span>My Profile</span>
                </div>
                <div className="profile-card">
                  <div className="profile-avatar">{initials}</div>
                  <div>
                    <div className="profile-name">{candidateUser.full_name}</div>
                    <div className="profile-email">{candidateUser.email}</div>
                    <div className="profile-role">Candidate</div>
                  </div>
                </div>
              </div>

              <div className="dash-section">
                <div className="dash-section-label">
                  <FaBookmark className="dash-section-icon" />
                  <span>Saved Courses ({savedCourses.length})</span>
                </div>
                {savedCourses.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: 14 }}>
                    No saved courses yet. Go to the Courses tab to save some!
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {savedCourses.map(c => (
                      <div key={c.id} className="saved-course-item">
                        <div>
                          <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{c.title}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{c.platform} · {c.tag}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="course-link"
                            style={{ fontSize: 12 }}
                          >
                            Open →
                          </a>
                          <button
                            className="drop-remove"
                            onClick={() => removeSavedCourse(c.id)}
                            title="Remove"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CALENDAR TAB ── */}
          {activeTab === 'calendar' && (
            <div className="dash-section">
              <div className="dash-section-label">
                <FaCalendarAlt className="dash-section-icon" />
                <span>Job Application Reminders</span>
              </div>

              {/* Add reminder form */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
                <input
                  type="text"
                  className="dash-textarea"
                  style={{ flex: 1, minWidth: 160, padding: '10px 14px', resize: 'none', height: 42 }}
                  placeholder="Reminder title (e.g. Apply to Google)"
                  value={reminderTitle}
                  onChange={e => setReminderTitle(e.target.value)}
                />
                <input
                  type="date"
                  className="dash-textarea"
                  style={{ width: 160, padding: '10px 14px', resize: 'none', height: 42 }}
                  value={reminderDate}
                  onChange={e => setReminderDate(e.target.value)}
                />
                <button
                  className="dash-analyze-btn"
                  style={{ width: 'auto', padding: '10px 20px', fontSize: 14 }}
                  onClick={addReminder}
                  disabled={!reminderTitle.trim() || !reminderDate}
                >
                  + Add Reminder
                </button>
              </div>

              {/* Reminders list */}
              {reminders.length === 0 ? (
                <div className="calendar-empty">
                  <FaCalendarAlt style={{ fontSize: 40, color: '#334155', marginBottom: 12 }} />
                  <p>No reminders set yet.</p>
                  <p style={{ fontSize: 13, color: '#475569', marginTop: 8 }}>
                    Set reminders for job application deadlines and interview schedules.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {reminders.map(r => (
                    <div key={r.id} className="reminder-item">
                      <div>
                        <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{r.title}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>📅 {r.date}</div>
                      </div>
                      <button
                        className="drop-remove"
                        style={{ marginLeft: 'auto' }}
                        onClick={() => deleteReminder(r.id)}
                        title="Delete reminder"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── HELP TAB ── */}
          {activeTab === 'help' && (
            <div className="dash-section">
              <div className="dash-section-label">
                <FaQuestionCircle className="dash-section-icon" />
                <span>Help &amp; FAQ</span>
              </div>
              <div className="help-list">
                {FAQ.map((item, i) => (
                  <div key={i} className="help-item">
                    <div className="help-q">❓ {item.q}</div>
                    <div className="help-a">{item.a}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <div className="dash-section-label">
                  <FaStar className="dash-section-icon" />
                  <span>Send Feedback</span>
                </div>
                <textarea
                  className="dash-textarea"
                  rows={4}
                  placeholder="Tell us how we can improve CVScanner..."
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                />
                <button
                  className="dash-analyze-btn"
                  style={{ marginTop: 12, padding: '12px 24px', width: 'auto' }}
                  onClick={() => { alert('Thank you for your feedback! 🙏'); setFeedbackText(''); }}
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="mobile-tab-bar">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`mobile-tab-item ${activeTab === t.id ? 'mobile-tab-active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 10, marginTop: 2 }}>{t.label}</span>
            {t.id === 'courses' && savedCourses.length > 0 && (
              <span className="notif-badge" style={{ position: 'absolute', top: 4, right: 8, width: 16, height: 16, fontSize: 9 }}>
                {savedCourses.length}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default CandidateDashboardPage;
