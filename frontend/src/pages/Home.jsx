import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { FaUpload, FaBrain, FaChartBar, FaUserCheck } from 'react-icons/fa';

function Home() {
  return (
    <div>
      <Navbar />

      <div className="hero-section">
        <div className="page-container">
          <h1 className="hero-title">
            AI-Powered Intelligent Resume Screening & Skill Gap Analysis
          </h1>
          <p className="hero-subtitle">
            Analyze candidate resumes, compare them with job descriptions,
            identify missing skills, and rank candidates effectively using
            Natural Language Processing.
          </p>
          <Link to="/select-role">
            <button className="hero-button">Get Started</button>
          </Link>
        </div>
      </div>

      <div className="page-container">
        <section className="section-block">
          <h2 className="section-title">Key Features</h2>

          <div className="feature-grid">
            <div className="feature-card">
              <FaUpload className="feature-icon" />
              <h3>Resume Upload</h3>
              <p>
                Upload one or more candidate resumes in PDF or DOCX format for
                intelligent screening.
              </p>
            </div>

            <div className="feature-card">
              <FaBrain className="feature-icon" />
              <h3>NLP Processing</h3>
              <p>
                Extract and analyze candidate skills from resume text using
                Natural Language Processing techniques.
              </p>
            </div>

            <div className="feature-card">
              <FaChartBar className="feature-icon" />
              <h3>Skill Gap Analysis</h3>
              <p>
                Compare extracted candidate skills with the required job skills
                and identify missing competencies.
              </p>
            </div>

            <div className="feature-card">
              <FaUserCheck className="feature-icon" />
              <h3>Candidate Ranking</h3>
              <p>
                Rank candidates based on match score and identify the best-fit
                profile for the job role.
              </p>
            </div>
          </div>
        </section>

        <section className="section-block">
          <h2 className="section-title">How It Works</h2>

          <div className="workflow-grid">
            <div className="workflow-step">
              <span className="step-number">1</span>
              <h3>Upload Resume</h3>
              <p>Upload one or multiple candidate resumes.</p>
            </div>

            <div className="workflow-step">
              <span className="step-number">2</span>
              <h3>Provide Job Description</h3>
              <p>Paste the job role requirements and expected skills.</p>
            </div>

            <div className="workflow-step">
              <span className="step-number">3</span>
              <h3>NLP Analysis</h3>
              <p>System extracts, compares, and evaluates skill relevance.</p>
            </div>

            <div className="workflow-step">
              <span className="step-number">4</span>
              <h3>View Results</h3>
              <p>Check ranking, dashboard insights, and recommendations.</p>
            </div>
          </div>
        </section>

        <section className="section-block callout-box">
          <h2>Why This Project Matters</h2>
          <p>
            Traditional resume screening is time-consuming and often misses
            important skill gaps. This platform automates the screening process,
            improves efficiency, and helps recruiters make smarter decisions.
          </p>
        </section>
      </div>

      <footer className="footer">
        <p>AI Resume Screening Platform © 2026</p>
      </footer>
    </div>
  );
}

export default Home;