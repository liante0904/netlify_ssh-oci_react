export const SUMMARY_NOTIFICATION_EVENT = 'ssh-summary-notification';

export function emitSummaryNotification(detail) {
  window.dispatchEvent(new CustomEvent(SUMMARY_NOTIFICATION_EVENT, {
    detail: {
      created_at: new Date().toISOString(),
      ...detail,
    },
  }));
}
