import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import AsyncErrorState from '../../src/components/AsyncErrorState';

describe('AsyncErrorState', () => {
  it('renders an accessible retry action', () => {
    const onRetry = jest.fn();
    const { getByRole } = render(
      <AsyncErrorState message="데이터를 불러오지 못했습니다." onRetry={onRetry} />
    );

    expect(getByRole('alert').textContent).toContain('데이터를 불러오지 못했습니다.');
    fireEvent.click(getByRole('button', { name: '다시 시도' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
