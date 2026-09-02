import React from 'react';

export default function GridSelectOverlay({ type, title, closeLabel, searchPlaceholder, searchTerm, onSearchTermChange, onClose, children }) {
  return <div className={`grid-overlay-portal ${type}-grid-overlay`}>
    <div className="grid-overlay-header">
      <div className="grid-header-top">
        <h3>{title}</h3>
        <button className="grid-close-btn" onClick={onClose} aria-label={closeLabel}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
        </button>
      </div>
      <div className="grid-search-wrapper">
        <input type="text" placeholder={searchPlaceholder} value={searchTerm} onChange={(event) => onSearchTermChange(event.target.value)} />
      </div>
    </div>
    <div className="grid-overlay-content">{children}</div>
  </div>;
}
