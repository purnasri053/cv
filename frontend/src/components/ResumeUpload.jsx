function ResumeUpload({ onFileChange }) {
  return (
    <div className="card">
      <label className="form-label">Upload Resume(s)</label>
      <input
        type="file"
        accept=".pdf,.docx"
        multiple
        onChange={onFileChange}
        className="file-input"
      />
    </div>
  );
}

export default ResumeUpload;