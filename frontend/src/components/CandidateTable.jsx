function CandidateTable({ candidates }) {
  return (
    <table className="candidate-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Candidate Name</th>
          <th>Match Score</th>
        </tr>
      </thead>
      <tbody>
        {candidates.map((candidate, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{candidate.name}</td>
            <td>{candidate.score}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default CandidateTable;