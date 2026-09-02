import React from 'react';
import { DEV_AUTH_ENABLED } from '../../utils/devAuth';
import { CONFIG } from '../../constants/config';
import './TelegramAuth.css';
import './AccountSettings.css';
import TelegramLoginPanel from './TelegramLoginPanel';
import TelegramUserPanel from './TelegramUserPanel';

function TelegramAuth({
  telegramUser,
  isAuthenticating,
  loginWithTelegram,
  loginWithDevBypass,
  handleLogout,
}) {
  const botName = CONFIG.TELEGRAM.BOT_NAME;

  return <div className="telegram-section">{telegramUser ? <TelegramUserPanel user={telegramUser} botName={botName} onLogout={handleLogout} /> : <TelegramLoginPanel isAuthenticating={isAuthenticating} loginWithTelegram={loginWithTelegram} loginWithDevBypass={loginWithDevBypass} devAuth={DEV_AUTH_ENABLED} />}</div>;
}

export default TelegramAuth;
