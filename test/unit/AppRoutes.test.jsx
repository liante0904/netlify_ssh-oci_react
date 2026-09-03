import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from '../../src/components/AppRoutes';

jest.mock('../../src/components/RequireAuth', () => ({ children }) => <>{children}</>);
jest.mock('../../src/components/NotFoundPage', () => () => <div>not found</div>);
jest.mock('../../src/components/HomeDashboard', () => () => <div>home</div>);

jest.mock('../../src/components/ReportList', () => ({ onWriterClick }) => (
  <section data-testid="report-route">
    <div>report data</div>
    <button onClick={() => {}}>date</button>
    <button onClick={() => {}}>company</button>
    <button onClick={() => {}}>summary</button>
    <button onClick={() => onWriterClick?.('writer')}>writer</button>
  </section>
));

jest.mock('../../src/components/SearchPageNew', () => () => (
  <section data-testid="search-route">
    <div>search data</div>
    <button onClick={() => {}}>date</button>
    <button onClick={() => {}}>company</button>
    <button onClick={() => {}}>summary</button>
  </section>
));

jest.mock('../../src/components/AdminConsole', () => () => <div>admin</div>);
jest.mock('../../src/components/FnGuideList', () => () => <div>fnguide</div>);
jest.mock('../../src/components/NotificationsPage', () => () => <div>notifications</div>);

const reportRoutes = ['/recent', '/global', '/industry', '/outlook', '/favorites', '/ai-summary'];

function renderRoute(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes onWriterClick={jest.fn()} />
    </MemoryRouter>
  );
}

describe('public report route lazy loading', () => {
  test('/notifications loads the notification page', async () => {
    renderRoute('/notifications');
    expect(await screen.findByText('notifications')).not.toBeNull();
  });

  test.each(reportRoutes)('%s loads data and tolerates interaction clicks', async (path) => {
    renderRoute(path);

    expect(await screen.findByTestId('report-route')).not.toBeNull();
    expect(screen.getByText('report data')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'date' }));
    fireEvent.click(screen.getByRole('button', { name: 'company' }));
    fireEvent.click(screen.getByRole('button', { name: 'summary' }));

    await waitFor(() => expect(screen.getByText('report data')).not.toBeNull());
  });

  test('/search-new loads data and tolerates interaction clicks', async () => {
    renderRoute('/search-new');

    expect(await screen.findByTestId('search-route')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'date' }));
    fireEvent.click(screen.getByRole('button', { name: 'company' }));
    fireEvent.click(screen.getByRole('button', { name: 'summary' }));

    await waitFor(() => expect(screen.getByText('search data')).not.toBeNull());
  });
});
