export default function AdminFirmRecords({ records }) {
  const max = Math.max(...records.map((firm) => firm.todayCount), 1);
  return <div className="section-card"><div className="section-title">🏦 증권사별 오늘 Insert 건수</div><div className="firm-list">{records.map((firm) => <div className="firm-row" key={firm.name}><span className="firm-name">{firm.name}</span><div className="firm-bar-bg"><div className="firm-bar-fill" style={{ width: `${(firm.todayCount / max) * 100}%` }} /></div><span className="firm-count">{firm.todayCount}</span></div>)}</div></div>;
}
