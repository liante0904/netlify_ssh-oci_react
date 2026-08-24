export default function LoadingSkeleton({ variant = 'list', rows = 5, label = '콘텐츠 로딩 중' }) {
  if (variant === 'spinner') {
    return <div className="loading-skeleton-spinner" role="status" aria-label={label} aria-busy="true"><span className="skeleton-spinner" /></div>;
  }

  if (variant === 'chips') {
    return (
      <div className="loading-skeleton loading-skeleton-chips" role="status" aria-label={label} aria-busy="true">
        {Array.from({ length: rows }, (_, index) => <span className="skeleton-chip" key={index} />)}
      </div>
    );
  }

  return (
    <div className={`loading-skeleton loading-skeleton-${variant}`} role="status" aria-label={label} aria-busy="true">
      {Array.from({ length: rows }, (_, index) => (
        <div className="skeleton-row" key={index}>
          <span className="skeleton-block skeleton-block-small" />
          <span className="skeleton-block skeleton-block-main" />
          <span className="skeleton-block skeleton-block-meta" />
        </div>
      ))}
    </div>
  );
}
