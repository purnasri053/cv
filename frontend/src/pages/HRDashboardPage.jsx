import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ResumeUpload from '../components/ResumeUpload';
import JobDescriptionForm from '../components/JobDescriptionForm';
import API from '../services/api';

function HRDashboardPage() {
  const [resumeFiles, setResumeFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [shortlistCount, setShortlistCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const hrUser = JSON.parse(localStorage.getItem('hrUser'));

  if (!hrUser) {
    return (
      <div>
        <Navbar />
        <div className="page-container">
          <div className="dashboard-card large-card">
            <h2>Access Denied</h2>
            <p>Please login as HR to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    setResumeFiles((prevFiles) => {
      const existingNames = prevFiles.map((file) => file.name);
      const filteredNewFiles = newFiles.filter(
        (file) => !existingNames.includes(file.name)
      );
      return [...prevFiles, ...filteredNewFiles];
    });
  };

  const handleRemoveFile = (indexToRemove) => {
    setResumeFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleAnalyze = async () => {
    if (resumeFiles.length === 0 || !jobDescription.trim()) {
      alert('Please upload resumes and enter the job description.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      for (let i = 0; i < resumeFiles.length; i++) {
        formData.append('resumes', resumeFiles[i]);
      }

      formData.append('jobDescription', jobDescription);
      formData.append('shortlistCount', shortlistCount);

      const response = await API.post('/analyze-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      localStorage.setItem('hrShortlistData', JSON.stringify(response.data));
      navigate('/hr-shortlist');
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
          <h2>HR Dashboard</h2>
          <p>
            Welcome, {hrUser.full_name}. Upload multiple candidate resumes,
            provide the target job description, and shortlist the best profiles
            automatically.
          </p>
        </div>

        <ResumeUpload onFileChange={handleFileChange} />

        {resumeFiles.length > 0 && (
          <div className="dashboard-card">
            <h3>Uploaded Resumes</h3>
            <ul>
              {resumeFiles.map((file, index) => (
                <li key={index}>
                  {file.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    style={{ marginLeft: '10px' }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="dashboard-card">
          <h3>Shortlist Settings</h3>
          <label>How many candidates do you want to shortlist?</label>
          <input
            type="number"
            className="text-area"
            value={shortlistCount}
            onChange={(e) => setShortlistCount(e.target.value)}
            placeholder="Enter shortlist count"
          />
        </div>

        <div className="dashboard-card">
          <h3>Job Role Input</h3>
          <JobDescriptionForm
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
          />
        </div>

        <button onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Shortlisting...' : 'Shortlist Candidates'}
        </button>
      </div>
    </div>
  );
}

export default HRDashboardPage;