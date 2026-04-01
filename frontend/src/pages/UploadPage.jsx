import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ResumeUpload from '../components/ResumeUpload';
import JobDescriptionForm from '../components/JobDescriptionForm';
import API from '../services/api';

function UploadPage() {
  const [resumeFiles, setResumeFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (resumeFiles.length === 0 || !jobDescription.trim()) {
      alert('Please upload at least one resume and enter the job description.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      for (let i = 0; i < resumeFiles.length; i++) {
        formData.append('resumes', resumeFiles[i]);
      }

      formData.append('jobDescription', jobDescription);

      const response = await API.post('/analyze-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      localStorage.setItem('analysisData', JSON.stringify(response.data));
      navigate('/analysis');
    } catch (error) {
      console.error('Error uploading data:', error);
      alert('Backend connection failed. Make sure Flask backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setResumeFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleRemoveFile = (indexToRemove) => {
    setResumeFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h2>Resume & Job Description Input</h2>
        <p>
          Upload one or more candidate resumes and paste the job description to
          start the NLP-based screening process.
        </p>

        <ResumeUpload onFileChange={handleFileChange} />

        {resumeFiles.length > 0 && (
          <div className="card">
            <h3>Selected Files</h3>
            <ul>
              {resumeFiles.map((file, index) => (
                <li key={index}>
                  {file.name}{' '}
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

        <JobDescriptionForm
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
        />

        <button onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Resume(s)'}
        </button>
      </div>
    </div>
  );
}

export default UploadPage;