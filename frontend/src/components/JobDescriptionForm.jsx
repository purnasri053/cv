function JobDescriptionForm({ jobDescription, setJobDescription }) {
  return (
    <div className="card">
      <label className="form-label">Job Description</label>
      <textarea
        rows="10"
        placeholder="Paste the job description here..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        className="text-area"
      />
    </div>
  );
}

export default JobDescriptionForm;