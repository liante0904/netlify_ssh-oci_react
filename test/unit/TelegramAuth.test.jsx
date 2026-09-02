import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import TelegramAuth from '../../src/components/menu/TelegramAuth';

jest.mock('../../src/utils/devAuth', () => ({ DEV_AUTH_ENABLED: false }));
jest.mock('../../src/constants/config', () => ({ CONFIG: { TELEGRAM: { BOT_NAME: 'test_bot' } } }));

describe('TelegramAuth', () => {
  it('exposes account settings and theme controls for logged-in users', () => {
    const onOpenSettings = jest.fn();
    const onToggleTheme = jest.fn();
    const { container } = render(<TelegramAuth telegramUser={{ id: 7, first_name: '신승훈' }} toggleKeywordOverlay={onOpenSettings} toggleTheme={onToggleTheme} theme="dark" themePreference="system" />);

    expect(container.querySelector('.user-name').textContent).toContain('신승훈님');
    fireEvent.click(screen.getByRole('button', { name: /내 설정/ }));
    fireEvent.click(screen.getByRole('button', { name: /화면 모드/ }));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
    expect(onToggleTheme).toHaveBeenCalledTimes(1);
  });
});
