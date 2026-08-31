import React from 'react';

function AdminFirmHealthTable({ firmHealth }) {
  if (!firmHealth) return null;

  return (
    <div className="firm-health-table">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>증권사</th>
            <th>전체</th>
            <th>마지막일자</th>
            <th>Days</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {firmHealth.firms.map((firm) => {
            const statusColor = firm.status === 'STALE' ? '#ff3b30' : firm.status === 'WARN' ? '#ff9500' : firm.status === 'FUTURE' ? '#007aff' : '#34c759';
            const statusBg = firm.status === 'STALE' ? 'rgba(255,59,48,0.12)' : firm.status === 'WARN' ? 'rgba(255,149,0,0.12)' : 'rgba(52,199,89,0.08)';
            return (
              <tr key={firm.sec_firm_order} className={firm.status !== 'OK' ? 'is-warning' : ''} style={{ '--firm-status-bg': statusBg }}>
                <td className="firm-health-order">{firm.sec_firm_order}</td>
                <td className={firm.status === 'STALE' ? 'is-stale' : ''}>{firm.firm_nm}</td>
                <td className="align-right">{firm.total.toLocaleString()}</td>
                <td className="align-right monospace">{firm.last_report_date || '-'}</td>
                <td className="align-right firm-health-days" style={{ '--firm-status-color': statusColor }}>{firm.days_ago >= 0 ? `${firm.days_ago}d` : '?'}</td>
                <td className="align-center firm-health-status" style={{ '--firm-status-color': statusColor }}>{firm.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AdminFirmHealthTable;
