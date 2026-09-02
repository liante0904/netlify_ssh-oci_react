import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PDFViewerModal from '../../src/components/report/PDFViewerModal';

jest.mock('../../src/utils/reportLinks', () => ({
  getProxyPdfUrl: jest.fn(() => 'https://example.com/report.pdf')
}));

jest.mock('../../src/hooks/usePdfDocument', () => ({
  usePdfDocument: () => ({
    loading: false,
    pages: [],
    scale: 1,
    setScale: jest.fn(),
    pageWidthRef: { current: 100 }
  })
}));

describe('PDFViewerModal', () => {
  const report = {
    title: '테스트 PDF',
    firm: '테스트 증권',
    writer: '홍길동',
    shareUrl: 'https://example.com/report/1'
  };

  beforeEach(() => {
    window.history.replaceState({}, '', '/recent');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: jest.fn(() => Promise.resolve()) }
    });
  });

  it('renders, copies the share URL, and closes with Escape', async () => {
    const onClose = jest.fn();
    render(<PDFViewerModal report={report} onClose={onClose} />);

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('테스트 PDF')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'URL 복사' }));
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(report.shareUrl));

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
