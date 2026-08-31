import { useCallback, useEffect, useMemo, useState } from 'react';
import { getDirectUrl } from '../utils/reportLinks';
import { getNotificationKey } from './useNotifications';

const SUMMARY_NOTIFICATION_EVENT = 'ssh-summary-notification';
const TOAST_TIMEOUT = 4500;

function normalizeLocalSummaryEvent(detail) {
  const id = `local-${detail.status || 'summary'}-${detail.report_id}-${Date.now()}`;
  return { id, report_id: detail.report_id, article_title: detail.article_title, firm_nm: detail.firm_nm || '', source: 'summary', notification_key: `local-summary:${id}`, message: detail.message, created_at: detail.created_at || new Date().toISOString(), status: detail.status };
}

export function useHeaderNotifications({ telegramUser, notifications, readNotifyIds, markAllAsRead, markAsRead, handleSearch, navigate, setActivePopover }) {
  const [localNotifications, setLocalNotifications] = useState([]);
  const [notificationToast, setNotificationToast] = useState(null);

  useEffect(() => {
    if (!telegramUser) return;
    try {
      const saved = localStorage.getItem('ssh_read_notifications');
      const ids = saved ? JSON.parse(saved) : [];
      if (Array.isArray(ids) && ids.length && readNotifyIds.length === 0) markAllAsRead(ids);
      if (saved) localStorage.removeItem('ssh_read_notifications');
    } catch { /* malformed legacy storage */ }
  }, [markAllAsRead, readNotifyIds, telegramUser]);

  useEffect(() => {
    const handler = (event) => {
      if (!telegramUser) return;
      const item = normalizeLocalSummaryEvent(event.detail || {});
      setLocalNotifications((current) => [item, ...current].slice(0, 20));
      setNotificationToast(item);
    };
    window.addEventListener(SUMMARY_NOTIFICATION_EVENT, handler);
    return () => window.removeEventListener(SUMMARY_NOTIFICATION_EVENT, handler);
  }, [telegramUser]);

  useEffect(() => {
    if (!notificationToast) return undefined;
    const timeoutId = window.setTimeout(() => setNotificationToast(null), TOAST_TIMEOUT);
    return () => window.clearTimeout(timeoutId);
  }, [notificationToast]);

  const visibleNotifications = useMemo(() => [...localNotifications, ...notifications]
    .filter((item, index, all) => all.findIndex((candidate) => getNotificationKey(candidate) === getNotificationKey(item)) === index)
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 50), [localNotifications, notifications]);
  const unreadCount = visibleNotifications.filter((item) => !readNotifyIds.includes(getNotificationKey(item)) && !readNotifyIds.includes(item.id)).length;

  const handleNotificationItemClick = useCallback((item) => {
    const key = getNotificationKey(item);
    if (!readNotifyIds.includes(key) && !readNotifyIds.includes(item.id)) markAsRead(key);
    setActivePopover(null);
    const report = { report_id: item.report_id, article_title: item.article_title || '', firm_nm: item.firm_nm || '', sec_firm_order: item.sec_firm_order ?? null, link: item.pdf_file_url || item.telegram_url || '', pdf_file_url: item.pdf_file_url || null, telegram_url: item.telegram_url || null };
    const url = getDirectUrl(report);
    if (url && item.report_id) window.open(url, '_blank');
    else if (item.article_title) { handleSearch(item.article_title); navigate('/'); }
  }, [handleSearch, markAsRead, navigate, readNotifyIds, setActivePopover]);

  return { visibleNotifications, unreadCount, notificationToast, handleNotificationItemClick };
}
