import LoadingSkeleton from './LoadingSkeleton';

export default function AsyncState({ isLoading, error, onRetry, isEmpty, empty, children, loadingLabel = '콘텐츠 불러오는 중' }) {
  if (isLoading) return <LoadingSkeleton rows={3} label={loadingLabel} />;
  if (error) {
    return (
      <div className="async-error-state" role="alert">
        <p>{error}</p>
        {onRetry && <button type="button" onClick={onRetry}>다시 시도</button>}
      </div>
    );
  }
  if (isEmpty) return empty;
  return children;
}
