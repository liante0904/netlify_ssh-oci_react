export default function AsyncErrorState({ onRetry, message = '데이터를 불러오지 못했습니다.' }) {
  return (
    <div className="async-error-state" role="alert">
      <p>{message}</p>
      <button type="button" onClick={onRetry}>다시 시도</button>
    </div>
  );
}
