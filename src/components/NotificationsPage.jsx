import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReport } from '../context/useReport';
import { useNotificationReadStatus } from '../hooks/useNotificationReadStatus';
import { getNotificationKey, useNotifications } from '../hooks/useNotifications';
import { getDirectUrl } from '../utils/reportLinks';
import AsyncState from './AsyncState';
import { BellIcon } from './HeaderPopovers';
import './NotificationsPage.css';

function formatNotificationDate(value) {
  if (!value) return '시간 정보 없음';
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function NotificationCard({ item, unread, onClick }) {
  const isSummary = item.source === 'summary';
  return <button type="button" className={`notifications-card ${unread ? 'unread' : ''}`} onClick={() => onClick(item)}>
    <span className={`notifications-card-icon ${isSummary ? 'summary' : 'telegram'}`}>{isSummary ? '▲' : 'T'}</span>
    <span className="notifications-card-body"><strong>{item.message}</strong><small>{isSummary ? 'AI 요약 완료' : '텔레그램 리포트 알림'} · {formatNotificationDate(item.created_at)}</small></span>
    {unread && <span className="notifications-unread-label">읽지 않음</span>}
  </button>;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { telegramUser, handleSearch } = useReport();
  const { notifications, isLoadingNotifications, notificationError, retryNotifications } = useNotifications(telegramUser);
  const { readNotifyIds, markAllAsRead, markAsRead } = useNotificationReadStatus(telegramUser);
  const [filter, setFilter] = useState('all');
  const unread = (item) => !readNotifyIds.includes(getNotificationKey(item)) && !readNotifyIds.includes(item.id);
  const unreadCount = notifications.filter(unread).length;
  const filteredNotifications = notifications.filter((item) => filter === 'all' || (filter === 'unread' ? unread(item) : item.source === filter));

  const handleNotificationClick = (item) => {
    const key = getNotificationKey(item);
    if (unread(item)) markAsRead(key);
    const report = { report_id: item.report_id, article_title: item.article_title || '', firm_nm: item.firm_nm || '', sec_firm_order: item.sec_firm_order ?? null, link: item.pdf_file_url || item.telegram_url || '', pdf_file_url: item.pdf_file_url || null, telegram_url: item.telegram_url || null };
    const url = getDirectUrl(report);
    if (url && item.report_id) window.open(url, '_blank', 'noopener,noreferrer');
    else if (item.article_title) { handleSearch(item.article_title); navigate('/'); }
  };

  return <main className="notifications-page">
    <div className="notifications-page-header"><div><span className="notifications-eyebrow">Notifications</span><h1>리포트 알림</h1><p>키워드 리포트와 AI 요약 완료 알림을 한곳에서 확인하세요.</p></div><span className="notifications-header-icon"><BellIcon /></span></div>
    <section className="notifications-toolbar" aria-label="알림 필터"><div className="notifications-filters">{[['all', '전체'], ['unread', '안 읽음'], ['telegram', '텔레그램'], ['summary', 'AI 요약']].map(([value, label]) => <button key={value} type="button" className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}{value === 'unread' && unreadCount > 0 && <span>{unreadCount}</span>}</button>)}</div>{unreadCount > 0 && <button type="button" className="notifications-mark-all" onClick={() => markAllAsRead(notifications.map((item) => getNotificationKey(item)))}>모두 읽음</button>}</section>
    <section className="notifications-list" aria-live="polite"><AsyncState isLoading={isLoadingNotifications} error={notificationError?.message || '알림을 불러오지 못했습니다.'} onRetry={retryNotifications} isEmpty={!filteredNotifications.length} empty={<div className="notifications-empty"><BellIcon /><strong>{filter === 'unread' ? '읽지 않은 알림이 없습니다.' : '표시할 알림이 없습니다.'}</strong><p>새로운 리포트 알림이 도착하면 이곳에 표시됩니다.</p></div>}>{filteredNotifications.map((item) => <NotificationCard key={getNotificationKey(item)} item={item} unread={unread(item)} onClick={handleNotificationClick} />)}</AsyncState></section>
  </main>;
}
