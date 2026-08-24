export function formatNotificationMessage(item) {
  const message = String(item?.message || '');
  const firmName = String(item?.firm_nm || '').trim();
  if (!firmName || item?.summary_model) return message;

  // 텔레그램 알림의 기존 첫 머리말([텔레그램 · 작성자])만 증권사명으로 교체한다.
  return message.replace(/^\s*\[[^\]]*\]/, `[${firmName}]`);
}
