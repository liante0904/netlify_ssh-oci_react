export default function AdminSummaryCards({ summary }) {
  const cards = [['📄', summary.totalArchived.toLocaleString(), '최근 7일 아카이브'], ['📥', summary.todayCount.toLocaleString(), '오늘 Insert'], ['🏦', summary.activeFirms, `활성 증권사 / ${summary.totalFirms}`], ['⏳', summary.pendingReprocess, '재처리 대기']];
  return <div className="summary-row">{cards.map(([icon, value, label]) => <div className="summary-card" key={label}><div className="card-icon">{icon}</div><div className="card-value">{value}</div><div className="card-label">{label}</div></div>)}</div>;
}
