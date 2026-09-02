import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import TelegramAuth from '../../src/components/menu/TelegramAuth';
import AccountPopover from '../../src/components/header/AccountPopover';

jest.mock('../../src/utils/devAuth', () => ({ DEV_AUTH_ENABLED: false }));
jest.mock('../../src/constants/config', () => ({ CONFIG: { TELEGRAM: { BOT_NAME: 'test_bot' } } }));

describe('TelegramAuth', () => {
  it('keeps logged-in hamburger account panel focused on Telegram connection', () => {
    const { container } = render(<TelegramAuth telegramUser={{ id: 7, first_name: '신승훈' }} />);

    expect(container.querySelector('.user-name').textContent).toContain('신승훈님');
    expect(screen.queryByRole('button', { name: /내 설정/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /화면 모드/ })).toBeNull();
  });

  it('exposes settings and theme controls from the account popover', () => {
    const onOpenSettings = jest.fn();
    const onToggleTheme = jest.fn();
    render(<AccountPopover telegramUser={{ id: 7, first_name: '신승훈' }} onClose={jest.fn()} onOpenSettings={onOpenSettings} onLogout={jest.fn()} theme="dark" themePreference="system" onToggleTheme={onToggleTheme} />);

    fireEvent.click(screen.getByRole('button', { name: /내 설정/ }));
    fireEvent.click(screen.getByRole('button', { name: /화면 모드/ }));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
    expect(onToggleTheme).toHaveBeenCalledTimes(1);
  });
});
