import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaLightbulb, FaStar, FaTrophy, FaRocket, FaFire } from 'react-icons/fa';
import Navbar from '../components/Navbar';

// Confetti burst component
function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2.5 + Math.random() * 2,
    color: ['#6366f1','#8b5cf6','#f472b6','#fbbf24','#34d399','#60a5fa'][Math.floor(Math.random() * 6)],
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
  }));

  return (
    <div className="confetti-wrap" aria-hidden="true">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            background: p.color,
            width: p.size,
            height: p.size,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function CandidateAnalysisPage() {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  const storedData = JSON.parse(localStorage.getItem('candidateAnalysisData'));

  const extractedSkills = storedData?.extractedSkills || [];
  const requiredSkills  = storedData?.requiredSkills  || [];
  const missingSkills   = storedData?.missingSkills   || [];
  const matchScore      = storedData?.matchScore      || 0;
  const candidateName   = storedData?.candidateName   || 'Candidate';
  const firstName       = candidateName.split(' ')[0];

  const isExcellent = matchScore >= 80;

  useEffect(() => {
    if (isExcellent) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 4500);
      return () => clearTimeout(t);
    }
  }, [isExcellent]);

  const getScoreMeta = (s) => {
    if (s >= 80) return { color: '#4ade80', bg: 'rgba(34,197,94,0.12)', ring: 'rgba(34,197,94,0.4)', label: 'Highly Suitable' };
    if (s >= 50) return { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', ring: 'rgba(251,191,36,0.4)', label: 'Moderately Suitable' };
    return { color: '#f87171', bg: 'rgba(239,68,68,0.12)', ring: 'rgba(239,68,68,0.4)', label: 'Needs Improvement' };
  };

  const meta = getScoreMeta(matchScore);

  const motivationMessages = [
    `You're absolutely crushing it, ${firstName}! 🔥`,
    `Outstanding work, ${firstName}! Your resume is a perfect fit!`,
    `${firstName}, you're ready to land this role. Apply with confidence!`,
    `Top-tier match, ${firstName}! Recruiters will love your profile.`,
  ];
  const motivationMsg = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];

  return (
    <div className="dash-page">
      {showConfetti && <Confetti />}
      <Navbar />
      <div className="results-page">

        {/* Header */}
        <div className="results-header">
          <button className="results-back-btn" onClick={() => navigate('/candidate-dashboard')}>
            <FaArrowLeft /> Back
          </button>
          <div className="results-title-block">
            <h1>Resume Analysis</h1>
            <p>Here's how your resume stacks up against the job role</p>
          </div>
          <div />
        </div>

        {/* 🎉 Celebration Banner — only for 80%+ */}
        {isExcellent && (
          <div className="celebration-banner">
            <div className="celebration-trophy"><FaTrophy /></div>
            <div className="celebration-content">
              <div className="celebration-title">Congratulations, {firstName}! 🎉</div>
              <div className="celebration-msg">{motivationMsg}</div>
              <div className="celebration-sub">
                Your resume is an excellent match for this role. You have all the key skills required — go ahead and apply!
              </div>
            </div>
            <div className="celebration-score">{matchScore}%</div>
          </div>
        )}

        {/* Score Hero */}
        <div className="score-hero" style={{ borderColor: meta.ring }}>
          <div className="score-circle" style={{ background: meta.bg, borderColor: meta.ring }}>
            <span className="score-circle-num" style={{ color: meta.color }}>{matchScore}%</span>
            <span className="score-circle-label">Match</span>
          </div>
          <div className="score-hero-info">
            <div className="score-hero-name">
              {candidateName}
              {isExcellent && <FaFire style={{ color: '#f97316', marginLeft: 8, fontSize: 20 }} />}
            </div>
            <div className="score-hero-status" style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.ring}` }}>
              {isExcellent && <FaRocket style={{ marginRight: 6 }} />}
              {meta.label}
            </div>
            <p className="score-hero-desc">
              {isExcellent && `Amazing, ${firstName}! Your skills are perfectly aligned with this role. You're a top candidate — apply now and own it!`}
              {matchScore >= 50 && matchScore < 80 && `Good progress, ${firstName}! You're on the right track. Work on the missing skills below to push your score higher.`}
              {matchScore < 50 && `Don't give up, ${firstName}! Every expert was once a beginner. Focus on the missing skills below and you'll get there.`}
            </p>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="analysis-skills-grid">
          <div className="analysis-skill-card">
            <div className="analysis-skill-header" style={{ color: '#4ade80' }}>
              <FaCheckCircle /> Your Skills ({extractedSkills.length})
            </div>
            <div className="skill-tags">
              {extractedSkills.length > 0
                ? extractedSkills.map((s, i) => <span key={i} className="skill-tag skill-tag-green">{s}</span>)
                : <span className="skill-empty">No skills extracted</span>}
            </div>
          </div>

          <div className="analysis-skill-card">
            <div className="analysis-skill-header" style={{ color: '#a5b4fc' }}>
              <FaStar /> Required Skills ({requiredSkills.length})
            </div>
            <div className="skill-tags">
              {requiredSkills.length > 0
                ? requiredSkills.map((s, i) => <span key={i} className="skill-tag skill-tag-purple">{s}</span>)
                : <span className="skill-empty">No required skills found</span>}
            </div>
          </div>

          <div className="analysis-skill-card">
            <div className="analysis-skill-header" style={{ color: '#f87171' }}>
              <FaTimesCircle /> Missing Skills ({missingSkills.length})
            </div>
            <div className="skill-tags">
              {missingSkills.length > 0
                ? missingSkills.map((s, i) => <span key={i} className="skill-tag skill-tag-red">{s}</span>)
                : <span className="skill-tag skill-tag-green">None — perfect match! 🎯</span>}
            </div>
          </div>
        </div>

        {/* Motivation card for excellent score */}
        {isExcellent && (
          <div className="motivation-card">
            <div className="motivation-icon"><FaRocket /></div>
            <div>
              <div className="motivation-title">You're interview-ready, {firstName}!</div>
              <p className="motivation-body">
                Your resume covers all the required skills for this role. Here's what makes you stand out:
              </p>
              <div className="skill-tags" style={{ marginTop: 12 }}>
                {extractedSkills.map((s, i) => (
                  <span key={i} className="skill-tag skill-tag-green">✓ {s}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Improvement Suggestions — for non-excellent scores */}
        {missingSkills.length > 0 && (
          <div className="results-card">
            <div className="results-card-header">
              <FaLightbulb style={{ color: '#f59e0b' }} />
              <h3>{isExcellent ? 'Keep Growing — Bonus Skills to Add' : 'Improvement Suggestions'}</h3>
            </div>
            {!isExcellent && (
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
                {matchScore >= 50
                  ? `You're close, ${firstName}! Adding these skills will make your profile stand out even more.`
                  : `Focus on these skills, ${firstName}. Each one you add brings you closer to your dream role.`}
              </p>
            )}
            <div className="suggestions-list">
              {missingSkills.map((skill, i) => (
                <div className="suggestion-item" key={i}>
                  <div className="suggestion-num">{i + 1}</div>
                  <div>
                    <strong>{skill}</strong>
                    <p>
                      {isExcellent
                        ? `Adding ${skill} to your profile will make you an even stronger candidate for senior roles.`
                        : `Build projects or get certified in ${skill} and add it to your resume to boost your match score.`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default CandidateAnalysisPage;
