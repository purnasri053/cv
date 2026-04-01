import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaUpload, FaBrain, FaChartBar, FaUserCheck, FaFileAlt, FaDownload } from 'react-icons/fa';

function Home() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Already installed — hide banner
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (standalone) { setShowBanner(false); return; }

    // Capture native install prompt if available
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
    }
    setShowBanner(false);
    sessionStorage.setItem('pwa-dismissed', '1');
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa-dismissed', '1');
  };
  return (
    <div className="landing-page">

      {/* Install notification bar — top of page */}
      {showBanner && (
        <div className="install-topbar">
          <span className="install-topbar-icon">📱</span>
          <span className="install-topbar-text">
            Install CVScanner for a better experience 🚀
          </span>
          <div className="install-topbar-actions">
            <button className="install-topbar-btn" onClick={handleInstall}>
              Install
            </button>
            <button className="install-topbar-dismiss" onClick={handleDismiss}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <FaFileAlt className="landing-logo-icon" />
          <span>CVScanner</span>
        </div>
        <div className="landing-nav-actions">
          <Link to="/select-role">
            <button className="btn-ghost">Sign In</button>
          </Link>
          <Link to="/select-role">
            <button className="btn-accent">Create Account</button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-badge">AI-Powered Resume Screening</div>
        <h1 className="hero-title">
          Welcome to <span className="hero-highlight">CVScanner</span>
        </h1>
        <p className="hero-sub">
          Smarter hiring starts here. Match candidates to roles instantly,
          uncover skill gaps, and make confident decisions — all in one place.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="stat-num">10x</span>
            <span className="stat-label">Faster Screening</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="stat-num">95%</span>
            <span className="stat-label">Match Accuracy</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="stat-num">2 Roles</span>
            <span className="stat-label">Candidate & HR</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <p className="features-eyebrow">Everything you need</p>
        <h2 className="features-title">Built for both sides of hiring</h2>
        <div className="features-grid">
          <div className="feat-card">
            <div className="feat-icon-wrap feat-blue">
              <FaUpload />
            </div>
            <h3>Resume Upload</h3>
            <p>Upload PDF or DOCX resumes — single or bulk — and get results in seconds.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon-wrap feat-purple">
              <FaBrain />
            </div>
            <h3>NLP Analysis</h3>
            <p>Extract skills automatically from resume text using natural language processing.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon-wrap feat-teal">
              <FaChartBar />
            </div>
            <h3>Skill Gap Detection</h3>
            <p>See exactly which skills are missing compared to the job requirements.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon-wrap feat-orange">
              <FaUserCheck />
            </div>
            <h3>Candidate Ranking</h3>
            <p>Rank all applicants by match score and shortlist the best fits instantly.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <p className="features-eyebrow">Simple process</p>
        <h2 className="features-title">How it works</h2>
        <div className="steps-row">
          {[
            { n: '01', title: 'Upload Resume', desc: 'Drop in one or multiple candidate resumes.' },
            { n: '02', title: 'Add Job Description', desc: 'Paste the role requirements and expected skills.' },
            { n: '03', title: 'AI Analysis', desc: 'CVScanner extracts, compares and scores instantly.' },
            { n: '04', title: 'View Results', desc: 'Get rankings, skill gaps and hiring recommendations.' },
          ].map((step) => (
            <div className="step-card" key={step.n}>
              <span className="step-num">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <h2>Ready to hire smarter?</h2>
        <p>Sign in above to get started with CVScanner.</p>
      </section>

      <footer className="landing-footer">
        <div className="footer-logo">
          <FaFileAlt />
          <span>CVScanner</span>
        </div>
        <p>© 2026 CVScanner. AI Resume Screening Platform.</p>
      </footer>

    </div>
  );
}

export default Home;
