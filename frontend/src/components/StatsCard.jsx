export default function StatsCard({ title, value, note }) {
  return (
    <div className="card stat-card">
      <p className="muted small">{title}</p>
      <h3>{value}</h3>
      {note ? <p className="small">{note}</p> : null}
    </div>
  );
}
