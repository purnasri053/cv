import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  FaUpload, FaFileAlt, FaBriefcase, FaRocket, FaTimesCircle, FaCheckCircle,
  FaUser, FaBook, FaCalendarAlt, FaQuestionCircle, FaStar, FaBell, FaTimes,
  FaTrash, FaBookmark, FaArrowLeft
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
  { q: 'How does resume analysis work?', a: 'Upload your resume and enter a job role. CVScanner extracts your skills and compares them with the required skills.' },
  { q: 'What file formats are supported?', a: 'PDF and DOCX files are supported.' },
  { q: 'How is the match score calculated?', a: 'Match score = (matched skills / required skills) × 100. 80%+ means highly suitable.' },
  { q: 'Can I analyze multiple job roles?', a: 'Yes! Go back to Analyze and upload your resume again with a different job description.' },
];

function loadLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function saveLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function CandidateDashboardPage() {
  const [view, setView]                     = useState('home'); // 'home' | 'analyze' | 'courses' | 'profile' | 'calendar' | 'help'
  const [resumeFile, setResumeFile]         = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [dragOver, setDragOver]             = useState(false);
  const [savedCourses, setSavedCourses]     = useState(() => loadLS('savedCourses', []));
  const [reminders, setReminders]           = useState(() => loadLS('calendarReminders', []));
  const [reminderTitle, setReminderTitle]   = useState('');
  const [reminderDate, setReminderDate]     = useState('');
  const [tomorrowBanners, setTomorrowBanners] = useState([]);
  const [feedbackText, setFeedbackText]     = useState('');
  const [notifications, setNotifications]   = useState([
    { id: 1, text: 'Upload your resume to get started!', time: 'Just now', read: false },
    { id: 2, text: 'New job openings match your profile', time: '1h ago', read: false },
  ]);
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();

  const candidateUser = loadLS('candidateUser', null);
  if (!candidateUser) return <Navigate to="/candidate-login" replace />;

  const initials = candidateUser.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const stored = loadLS('calendarReminders', []);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tStr = tomorrow.toISOString().split('T')[0];
    const due = stored.filter(r => r.date === tStr && !r.notified);
    if (due.length > 0) {
      setTomorrowBanners(due.map(r => r.title));
      const updated = stored.map(r => r.date === tStr ? { ...r, notified: true } : r);
      setReminders(updated);
      saveLS('calendarReminders', updated);
    }
  }, []);

  const handleFile = (file) => {
    if (file && (file.name.endsWith('.pdf') || file.name.endsWith('.docx'))) {
      setResumeFile(file); setError('');
    } else setError('Only PDF or DOCX files are supported.');
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
      saveLS('candidateAnalysisData', response.data);
      navigate('/candidate-analysis');
    } catch { setError('Could not reach the backend.'); }
    finally { setLoading(false); }
  };

  const toggleSaveCourse = (course) => {
    const updated = savedCourses.find(c => c.id === course.id)
      ? savedCourses.filter(c => c.id !== course.id)
      : [...savedCourses, course];
    setSavedCourses(updated); saveLS('savedCourses', updated);
  };

  const addReminder = () => {
    if (!reminderTitle.trim() || !reminderDate) return;
    const updated = [...reminders, { id: Date.now(), title: reminderTitle.trim(), date: reminderDate, notified: false }];
    setReminders(updated); saveLS('calendarReminders', updated);
    setReminderTitle(''); setReminderDate('');
  };

  const deleteReminder = (id) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated); saveLS('calendarReminders', updated);
  };

  // ── Dashboard home cards ──────────────────────────────────────────────────
  const menuCards = [
    {
      id: 'analyze', icon: <FaRocket />, label: 'Analyze Resume',
      desc: 'Upload your resume and get skill gap analysis', color: '#6366f1', bg: 'rgba(99,102,241,0.12)'
    },
    {
      id: 'courses', icon: <FaBook />, label: 'Courses',
      desc: `Browse recommended courses${savedCourses.length > 0 ? ` · ${savedCourses.length} saved` : ''}`,
      color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)'
    },
    {
      id: 'profile', icon: <FaUser />, label: 'My Profile',
      desc: 'View your profile and saved courses', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'
    },
    {
      id: 'calendar', icon: <FaCalendarAlt />, label: 'Calendar',
      desc: `Set job application reminders${reminders.length > 0 ? ` · ${reminders.length} set` : ''}`,
      color: '#14b8a6', bg: 'rgba(20,184,166,0.12)'
    },
    {
      id: 'help', icon: <FaQuestionCircle />, label: 'Help & FAQ',
      desc: 'Get answers and send feedback', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'
    },
  ];

  return (
    <div className="dash-page">
      <Navbar />

      {/* Tomorrow reminder banners */}
      {tomorrowBanners.map((title, i) => (
        <div key={i} className="reminder-badge">
          ⏰ Reminder tomorrow: <strong style={{ marginLeft: 6 }}>{title}</strong>
          <button onClick={() => setTomorrowBanners(prev => prev.filter((_, j) => j !== i))}><FaTimes /></button>
        </div>
      ))}

      <div className="cdash-page">

        {/* ── Header ── */}
        <div className="cdash-header">
          <div>
            {view !== 'home' && (
              <button className="cdash-back-btn" onClick={() => { setView('home'); setError(''); }}>
                <FaArrowLeft /> Dashboard
              </button>
            )}
            {view !== 'home' && (
              <h1 className="cdash-title">
                {view === 'analyze' && 'Analyze Resume'}
                {view === 'courses' && 'Courses'}
                {view === 'profile' && 'My Profile'}
                {view === 'calendar' && 'Calendar'}
                {view === 'help'    && 'Help & FAQ'}
              </h1>
            )}
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

        {/* ── HOME VIEW — 3 top + 2 bottom ── */}
        {view === 'home' && (
          <>
            {/* Compact Hero + Cards side by side */}
            <div className="cdash-home-layout">

              {/* Left — compact hero */}
              <div className="cdash-hero-compact">
                <div className="cdash-hero-badge">✨ AI Career Assistant</div>
                <h2 className="cdash-hero-title">
                  Ready to land your<br />
                  <span className="cdash-hero-highlight">dream job, {candidateUser.full_name.split(' ')[0]}?</span>
                </h2>
                <p className="cdash-hero-quote">
                  "Every expert was once a beginner. Your next opportunity starts with one upload." 🚀
                </p>
                <div className="cdash-hero-stats">
                  <div className="cdash-hero-stat">
                    <span className="cdash-hero-stat-num">10x</span>
                    <span className="cdash-hero-stat-label">Faster</span>
                  </div>
                  <div className="cdash-hero-stat-div" />
                  <div className="cdash-hero-stat">
                    <span className="cdash-hero-stat-num">95%</span>
                    <span className="cdash-hero-stat-label">Accuracy</span>
                  </div>
                  <div className="cdash-hero-stat-div" />
                  <div className="cdash-hero-stat">
                    <span className="cdash-hero-stat-num">Free</span>
                    <span className="cdash-hero-stat-label">Always</span>
                  </div>
                </div>
              </div>

              {/* Right — all 5 cards in a 2-col grid */}
              <div className="cdash-cards-right">
                {menuCards.map(card => (
                  <button key={card.id} className="cdash-menu-card-sm" onClick={() => setView(card.id)}>
                    <div className="cdash-card-icon-sm" style={{ background: card.bg, color: card.color }}>
                      {card.icon}
                    </div>
                    <div>
                      <div className="cdash-card-label-sm">{card.label}</div>
                      <div className="cdash-card-desc-sm">{card.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

            </div>
          </>
        )}

        {/* ── ANALYZE VIEW ── */}
        {view === 'analyze' && (
          <div>
            <div className="analyze-grid">
              <div className="dash-section">
                <div className="dash-section-label"><FaUpload className="dash-section-icon" /><span>Upload Your Resume</span></div>
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
                <div className="dash-section-label"><FaBriefcase className="dash-section-icon" /><span>Job Role or Description</span></div>
                <textarea className="dash-textarea" rows={7}
                  placeholder="Type a job role (e.g. 'software developer') or paste a full job description..."
                  value={jobDescription} onChange={e => setJobDescription(e.target.value)} />
                <div className="dash-char-count">{jobDescription.length} characters</div>
              </div>
            </div>
            <button className="dash-analyze-btn" onClick={handleAnalyze} disabled={loading}>
              <FaRocket />{loading ? 'Analyzing...' : 'Analyze My Resume'}
            </button>
          </div>
        )}

        {/* ── COURSES VIEW ── */}
        {view === 'courses' && (
          <div className="courses-grid">
            {COURSES.map(c => {
              const isSaved = savedCourses.some(s => s.id === c.id);
              return (
                <div key={c.id} className="course-card">
                  <div className="course-tag">{c.tag}</div>
                  <div className="course-title">{c.title}</div>
                  <div className="course-platform">{c.platform}</div>
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="course-link">Start Learning →</a>
                  <button className={`course-save-btn ${isSaved ? 'course-save-btn--saved' : ''}`} onClick={() => toggleSaveCourse(c)}>
                    <FaBookmark />{isSaved ? 'Saved' : 'Save'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── PROFILE VIEW ── */}
        {view === 'profile' && (
          <div>
            <div className="dash-section">
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
              <div className="dash-section-label"><FaBookmark className="dash-section-icon" /><span>Saved Courses ({savedCourses.length})</span></div>
              {savedCourses.length === 0
                ? <p style={{ color: '#64748b', fontSize: 14 }}>No saved courses yet. Go to Courses to save some!</p>
                : savedCourses.map(c => (
                  <div key={c.id} className="saved-course-item">
                    <div><div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{c.title}</div><div style={{ fontSize: 12, color: '#64748b' }}>{c.platform} · {c.tag}</div></div>
                    <div style={{ display: 'flex', gap: 10, marginLeft: 'auto', alignItems: 'center' }}>
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="course-link" style={{ fontSize: 12 }}>Open →</a>
                      <button className="drop-remove" onClick={() => { const u = savedCourses.filter(x => x.id !== c.id); setSavedCourses(u); saveLS('savedCourses', u); }}><FaTrash /></button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* ── CALENDAR VIEW ── */}
        {view === 'calendar' && (
          <div className="dash-section">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
              <input type="text" className="dash-textarea" style={{ flex: 1, minWidth: 160, padding: '10px 14px', resize: 'none', height: 42 }}
                placeholder="Reminder title (e.g. Apply to Google)" value={reminderTitle} onChange={e => setReminderTitle(e.target.value)} />
              <input type="date" className="dash-textarea" style={{ width: 160, padding: '10px 14px', resize: 'none', height: 42 }}
                value={reminderDate} onChange={e => setReminderDate(e.target.value)} />
              <button className="dash-analyze-btn" style={{ width: 'auto', padding: '10px 20px', fontSize: 14 }}
                onClick={addReminder} disabled={!reminderTitle.trim() || !reminderDate}>+ Add Reminder</button>
            </div>
            {reminders.length === 0
              ? <div className="calendar-empty"><FaCalendarAlt style={{ fontSize: 40, color: '#334155', marginBottom: 12 }} /><p>No reminders yet.</p></div>
              : reminders.map(r => (
                <div key={r.id} className="reminder-item">
                  <div><div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{r.title}</div><div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>📅 {r.date}</div></div>
                  <button className="drop-remove" style={{ marginLeft: 'auto' }} onClick={() => deleteReminder(r.id)}><FaTrash /></button>
                </div>
              ))
            }
          </div>
        )}

        {/* ── HELP VIEW ── */}
        {view === 'help' && (
          <div className="dash-section">
            <div className="help-list">
              {FAQ.map((item, i) => (
                <div key={i} className="help-item">
                  <div className="help-q">❓ {item.q}</div>
                  <div className="help-a">{item.a}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <div className="dash-section-label"><FaStar className="dash-section-icon" /><span>Send Feedback</span></div>
              <textarea className="dash-textarea" rows={4} placeholder="Tell us how we can improve CVScanner..."
                value={feedbackText} onChange={e => setFeedbackText(e.target.value)} />
              <button className="dash-analyze-btn" style={{ marginTop: 12, padding: '12px 24px', width: 'auto' }}
                onClick={() => { alert('Thank you! 🙏'); setFeedbackText(''); }}>Submit Feedback</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default CandidateDashboardPage;
