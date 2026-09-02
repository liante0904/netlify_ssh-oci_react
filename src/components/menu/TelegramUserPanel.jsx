import React from 'react';

export default function TelegramUserPanel({ user, botName, onLogout }) {
  return <div className="telegram-user-card"><div className="user-info-header"><span className="user-name">👤 {user.first_name}님 <small className="telegram-user-id">(ID:{user.id})</small></span><button className="logout-small-btn" onClick={onLogout}>로그아웃</button></div><div className="bot-connect-banner"><a href={`https://t.me/${botName}?start=${user.id}`} target="_blank" rel="noopener noreferrer" className="bot-connect-btn"><span className="icon">🚀</span> 텔레그램 봇 연결하기 (최초 1회 필수)</a></div></div>;
}
