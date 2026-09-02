import { calculateUpsidePercent, formatUpsidePercent } from '../../utils/financial';

export default function FnGuideFinancialGrid({ item }) {
  const upsidePercent = calculateUpsidePercent(item.target_price, item.prev_close);
  const hasTargetPrice = Boolean(item.target_price && item.target_price !== '0');
  return <><div className="card-financial-grid"><div className="grid-cell"><span className="cell-label">투자의견</span><strong className="cell-value opinion">{item.opinion || '-'}</strong></div><div className="grid-cell"><span className="cell-label">목표가</span><strong className="cell-value target-price">{hasTargetPrice ? item.target_price : '-'}</strong></div><div className="grid-cell"><span className="cell-label">직전 종가</span><strong className="cell-value prev-close">{item.prev_close && item.prev_close !== '0' ? item.prev_close : '-'}</strong></div><div className="grid-cell"><span className="cell-label">상승여력</span><strong className={`cell-value upside ${upsidePercent === null ? '' : upsidePercent >= 0 ? 'positive' : 'negative'}`}>{upsidePercent === null ? '-' : formatUpsidePercent(upsidePercent)}</strong></div></div>{hasTargetPrice && upsidePercent === null && <p className="upside-data-note">직전 종가 데이터가 없어 상승여력을 계산하지 못했습니다.</p>}</>;
}
