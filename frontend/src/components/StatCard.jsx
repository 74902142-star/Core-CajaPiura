export default function StatCard({ icon, number, label, color = '#005B96', bgColor = '#e8f4fd' }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="stat-number">{number}</div>
          <div className="stat-label">{label}</div>
        </div>
        <div className="stat-icon" style={{ background: bgColor, color: color }}>
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
    </div>
  );
}
