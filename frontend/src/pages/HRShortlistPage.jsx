import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaDownload, FaArrowLeft, FaUserCheck, FaChartBar, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import Navbar from '../components/Navbar';

function HRShortlistPage() {
  const navigate = useNavigate();
  const storedData = JSON.parse(localStorage.getItem('hrShortlistData'));
  const allResults   = storedData?.allResults || [];
  const requiredSkills = storedData?.requiredSkills || [];
  const shortlistCount = parseInt(storedData?.shortlistCount || allResults.length, 10);
  const shortlisted  = allResults.slice(0, shortlistCount);
  const notShortlisted = allResults.slice(shortlistCount);

  const getScoreMeta = (score) => {
    if (score >= 80) return { color: '#4ade80', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', label: 'Excellent' };
    if (score >= 50) return { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)', label: 'Good' };
    return { color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', label: 'Low' };
  };

  const handleDownload = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210; // A4 width
    const margin = 18;
    const colW = W - margin * 2;
    let y = 0;

    const checkPage = (needed = 10) => {
      if (y + needed > 275) { doc.addPage(); y = 20; }
    };

    // ── Header bar ──
    doc.setFillColor(15, 15, 26);
    doc.rect(0, 0, W, 28, 'F');
    doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('CVScanner', margin, 17);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.setTextColor(129, 140, 248);
    doc.text('AI Resume Screening Report', margin + 42, 17);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}`, W - margin, 17, { align: 'right' });

    y = 38;

    // ── Title ──
    doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 41, 59);
    doc.text('Screening Results', margin, y); y += 7;
    doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
    doc.text(`Full skill gap analysis for all ${allResults.length} candidates`, margin, y); y += 10;

    // ── Summary boxes ──
    const boxes = [
      { label: 'Total Analyzed', value: String(allResults.length) },
      { label: 'Shortlisted',    value: String(shortlisted.length) },
      { label: 'Top Score',      value: `${shortlisted[0]?.score ?? 0}%` },
      { label: 'Not Shortlisted',value: String(notShortlisted.length) },
    ];
    const bw = (colW - 9) / 4;
    boxes.forEach((b, i) => {
      const bx = margin + i * (bw + 3);
      doc.setFillColor(248, 250, 252); doc.setDrawColor(226, 232, 240);
      doc.roundedRect(bx, y, bw, 18, 3, 3, 'FD');
      doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(99, 102, 241);
      doc.text(b.value, bx + bw / 2, y + 9, { align: 'center' });
      doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
      doc.text(b.label.toUpperCase(), bx + bw / 2, y + 15, { align: 'center' });
    });
    y += 26;

    // ── Required Skills ──
    if (requiredSkills.length > 0) {
      doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 41, 59);
      doc.text('Required Skills for this Role', margin, y); y += 6;
      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(99, 102, 241);
      const skillLine = requiredSkills.join('  •  ');
      const wrapped = doc.splitTextToSize(skillLine, colW);
      doc.text(wrapped, margin, y); y += wrapped.length * 5 + 8;
    }

    // ── Candidate section renderer ──
    const renderSection = (list, title, isShortlisted) => {
      checkPage(16);
      // Section title bar
      doc.setFillColor(isShortlisted ? 220 : 254, isShortlisted ? 252 : 226, isShortlisted ? 231 : 226);
      doc.roundedRect(margin, y, colW, 10, 2, 2, 'F');
      doc.setFontSize(10); doc.setFont('helvetica', 'bold');
      doc.setTextColor(isShortlisted ? 22 : 185, isShortlisted ? 163 : 28, isShortlisted ? 74 : 26);
      doc.text(`${isShortlisted ? '[SHORTLISTED]' : '[NOT SHORTLISTED]'}  ${title}  (${list.length})`, margin + 4, y + 7);
      y += 14;

      list.forEach((c, idx) => {
        checkPage(40);
        const score = c.score;
        const scoreMeta = score >= 80 ? { r:22,g:163,b:74 } : score >= 50 ? { r:217,g:119,b:6 } : { r:220,g:38,b:38 };

        // Card background
        doc.setFillColor(248, 250, 252); doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, y, colW, 36, 3, 3, 'FD');

        // Rank + name
        doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 41, 59);
        const medal = idx === 0 && isShortlisted ? '#1 ' : idx === 1 && isShortlisted ? '#2 ' : idx === 2 && isShortlisted ? '#3 ' : `#${idx + 1}  `;
        const displayName = c.name.length > 45 ? c.name.substring(0, 45) + '...' : c.name;
        doc.text(`${medal}${displayName}`, margin + 4, y + 8);

        // Score pill
        doc.setFillColor(scoreMeta.r, scoreMeta.g, scoreMeta.b);
        doc.roundedRect(W - margin - 22, y + 3, 20, 7, 2, 2, 'F');
        doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
        doc.text(`${score}%`, W - margin - 12, y + 8, { align: 'center' });

        // Score bar
        doc.setFillColor(226, 232, 240);
        doc.roundedRect(margin + 4, y + 12, colW - 30, 3, 1, 1, 'F');
        doc.setFillColor(scoreMeta.r, scoreMeta.g, scoreMeta.b);
        doc.roundedRect(margin + 4, y + 12, (colW - 30) * score / 100, 3, 1, 1, 'F');

        // Has skills
        doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(22, 163, 74);
        doc.text('HAS:', margin + 4, y + 22);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(51, 65, 85);
        const hasText = c.extractedSkills?.join(', ') || 'None';
        const hasWrapped = doc.splitTextToSize(hasText, (colW / 2) - 12);
        doc.text(hasWrapped, margin + 14, y + 22);

        // Missing skills
        doc.setFont('helvetica', 'bold'); doc.setTextColor(220, 38, 38);
        doc.text('MISSING:', margin + colW / 2 + 2, y + 22);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(51, 65, 85);
        const missingText = c.missingSkills?.join(', ') || 'None — full match';
        const missingWrapped = doc.splitTextToSize(missingText, (colW / 2) - 16);
        doc.text(missingWrapped, margin + colW / 2 + 18, y + 22);

        y += 40;
      });
      y += 4;
    };

    if (shortlisted.length > 0)    renderSection(shortlisted,    'Shortlisted Candidates', true);
    if (notShortlisted.length > 0) renderSection(notShortlisted, 'Not Shortlisted — Skill Gap', false);

    // ── Footer on every page ──
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(15, 15, 26);
      doc.rect(0, 287, W, 10, 'F');
      doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(71, 85, 105);
      doc.text('CVScanner — AI Resume Screening Platform', margin, 293);
      doc.text(`Page ${i} of ${pageCount}`, W - margin, 293, { align: 'right' });
    }

    doc.save('CVScanner_Report.pdf');
  };

  const CandidateRow = ({ c, index, isShortlisted }) => {
    const meta = getScoreMeta(c.score);
    return (
      <div className={`candidate-full-card ${isShortlisted ? 'card-shortlisted' : 'card-rejected'}`}>
        <div className="cfc-header">
          <div className="cfc-rank">
            {index === 0 && isShortlisted ? '🥇' : index === 1 && isShortlisted ? '🥈' : index === 2 && isShortlisted ? '🥉' : `#${index + 1}`}
          </div>
          <div className="cfc-avatar">{c.name.charAt(0).toUpperCase()}</div>
          <div className="cfc-name-block">
            <div className="cfc-name">{c.name}</div>
            <span className="rating-pill" style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>{meta.label}</span>
          </div>
          <div className="cfc-score-block">
            <div className="cfc-score-num" style={{ color: meta.color }}>{c.score}%</div>
            <div className="cfc-score-bar-track">
              <div className="cfc-score-bar-fill" style={{ width: `${c.score}%`, background: meta.color }} />
            </div>
          </div>
          <div className="cfc-status">
            {isShortlisted
              ? <span className="shortlist-badge"><FaCheckCircle /> Shortlisted</span>
              : <span className="rejected-badge"><FaTimesCircle /> Not Shortlisted</span>}
          </div>
        </div>

        <div className="cfc-skills-row">
          <div className="cfc-skill-block">
            <div className="cfc-skill-label" style={{ color: '#4ade80' }}>✓ Has Skills</div>
            <div className="skill-tags">
              {c.extractedSkills?.length > 0
                ? c.extractedSkills.map((s, i) => <span key={i} className="skill-tag skill-tag-green">{s}</span>)
                : <span className="skill-empty">None detected</span>}
            </div>
          </div>
          <div className="cfc-skill-block">
            <div className="cfc-skill-label" style={{ color: '#f87171' }}>✗ Missing Skills</div>
            <div className="skill-tags">
              {c.missingSkills?.length > 0
                ? c.missingSkills.map((s, i) => <span key={i} className="skill-tag skill-tag-red">{s}</span>)
                : <span className="skill-tag skill-tag-green">No gaps — full match</span>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dash-page">
      <Navbar />
      <div className="results-page">

        {/* Header */}
        <div className="results-header">
          <button className="results-back-btn" onClick={() => navigate('/hr-dashboard')}>
            <FaArrowLeft /> Back
          </button>
          <div className="results-title-block">
            <h1>Screening Results</h1>
            <p>Full skill gap analysis for all {allResults.length} candidates</p>
          </div>
          <button className="results-download-btn" onClick={handleDownload}>
            <FaDownload /> Download Report
          </button>
        </div>

        {/* Stats */}
        <div className="results-stats">
          <div className="results-stat-card">
            <div className="results-stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}><FaChartBar /></div>
            <div><div className="results-stat-num">{allResults.length}</div><div className="results-stat-label">Total Analyzed</div></div>
          </div>
          <div className="results-stat-card">
            <div className="results-stat-icon" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}><FaUserCheck /></div>
            <div><div className="results-stat-num">{shortlisted.length}</div><div className="results-stat-label">Shortlisted</div></div>
          </div>
          <div className="results-stat-card">
            <div className="results-stat-icon" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}><FaTrophy /></div>
            <div><div className="results-stat-num">{shortlisted[0]?.score ?? 0}%</div><div className="results-stat-label">Top Score</div></div>
          </div>
        </div>

        {/* Required Skills */}
        {requiredSkills.length > 0 && (
          <div className="results-card" style={{ marginBottom: 24 }}>
            <h3>Required Skills for this Role</h3>
            <div className="skill-tags" style={{ marginTop: 8 }}>
              {requiredSkills.map((s, i) => <span key={i} className="skill-tag skill-tag-purple">{s}</span>)}
            </div>
          </div>
        )}

        {/* Shortlisted */}
        {shortlisted.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div className="section-divider-label shortlisted-label">
              <FaCheckCircle /> Shortlisted Candidates ({shortlisted.length})
            </div>
            {shortlisted.map((c, i) => <CandidateRow key={i} c={c} index={i} isShortlisted={true} />)}
          </div>
        )}

        {/* Not Shortlisted */}
        {notShortlisted.length > 0 && (
          <div>
            <div className="section-divider-label rejected-label">
              <FaTimesCircle /> Not Shortlisted — Skill Gap Analysis ({notShortlisted.length})
            </div>
            {notShortlisted.map((c, i) => <CandidateRow key={i} c={c} index={i} isShortlisted={false} />)}
          </div>
        )}

        {allResults.length === 0 && (
          <div className="results-card" style={{ textAlign: 'center', padding: 48 }}>
            <p style={{ color: '#475569' }}>No results found. Go back and upload resumes.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default HRShortlistPage;
