import { getDirectUrl } from '../utils/reportLinks';

export default function HomePreviewRow({ item, isFnGuide, route, onRequireAuth, onNavigate }) {
  const handleClick = () => {
    if (!onRequireAuth(isFnGuide ? route : undefined)) return;
    if (isFnGuide) onNavigate(`${route}?summary_id=${item.id}`);
    else window.open(getDirectUrl(item.rawReport), '_blank', 'noopener,noreferrer');
  };

  return <button type="button" className="home-preview-row" onClick={handleClick}><span className="home-preview-main"><span className="home-preview-title">{item.title}</span>{item.meta && <span className="home-preview-meta">{item.meta}</span>}</span>{item.date && <span className="home-preview-date">{item.date}</span>}</button>;
}
