import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ResumeUpload from '../components/ResumeUpload';
import JobDescriptionForm from '../components/JobDescriptionForm';
import API from '../services/api';

function CandidateDashboardPage() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const candidateUser = JSON.parse(localStorage.getItem('candidateUser'));

  if (!candidateUser) {
    return (
      <div>
        <Navbar />
        <div className="page-container">
          <div className="dashboard-card large-card">
            <h2>Access Denied</h2>
            <p>Please login as Candidate to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      alert('Please upload your resume and enter the job description.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobDescription', jobDescription);

      const response = await API.post('/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      localStorage.setItem('candidateAnalysisData', JSON.stringify(response.data));
      navigate('/candidate-analysis');
    } catch (error) {
      console.error(error);
      alert('Backend connection failed. Make sure Flask backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="dashboard-card large-card">
          <h2>Candidate Dashboard</h2>
          <p>
            Welcome, {candidateUser.full_name}. Upload your resume and compare it
            with the target job role to identify missing skills and improve your
            chances of getting shortlisted.
          </p>
        </div>

        <ResumeUpload onFileChange={(e) => setResumeFile(e.target.files[0])} />

        {resumeFile && (
          <div className="dashboard-card">
            <h3>Selected Resume</h3>
            <p>{resumeFile.name}</p>
          </div>
        )}

        <div className="dashboard-card">
          <h3>Job Role Input</h3>
          <JobDescriptionForm
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
          />
        </div>

        <button onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze My Resume'}
        </button>
      </div>
    </div>
  );
}

export default CandidateDashboardPage;