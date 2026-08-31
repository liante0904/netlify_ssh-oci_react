import LoadingSkeleton from './LoadingSkeleton';
import AsyncErrorState from './AsyncErrorState';

export default function AsyncState({ isLoading, error, onRetry, isEmpty, empty, children, loadingLabel = '콘텐츠 불러오는 중' }) {
  if (isLoading) return <LoadingSkeleton rows={3} label={loadingLabel} />;
  if (error) return <AsyncErrorState message={error} onRetry={onRetry} />;
  if (isEmpty) return empty;
  return children;
}
