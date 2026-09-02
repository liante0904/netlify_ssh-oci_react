export default function AdminArchiveHistory({ archiveHistory }) {
  const max = Math.max(...archiveHistory.map((day) => day.count), 1);
  return <div className="section-card"><div className="section-title">📊 PDF 아카이브 현황 <span className="badge">최근 7일</span></div><div className="archive-history">{archiveHistory.map((day) => <div className="history-bar" key={day.label}><div className="bar" style={{ height: `${Math.max((day.count / max) * 100, 4)}%` }} title={`${day.count}건`} /><div className="bar-label">{day.label}</div></div>)}</div></div>;
}
