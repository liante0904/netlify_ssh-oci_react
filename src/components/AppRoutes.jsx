import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import RequireAuth from './RequireAuth';
import NotFoundPage from './NotFoundPage';
import HomeDashboard from './HomeDashboard';

const ReportList = lazy(() => import('./ReportList'));
const SearchPageNew = lazy(() => import('./SearchPageNew'));
const AdminConsole = lazy(() => import('./AdminConsole'));
const FnGuideList = lazy(() => import('./FnGuideList'));
const NotificationsPage = lazy(() => import('./NotificationsPage'));

function Protected({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}

export default function AppRoutes({ onWriterClick }) {
  const reportPaths = ['recent', 'global', 'industry', 'favorites', 'outlook', 'ai-summary'];
  return <Routes>
    <Route path="/" element={<HomeDashboard />} />
    {reportPaths.map((path) => <Route key={path} path={`/${path}`} element={<Protected><ReportList key={path} onWriterClick={onWriterClick} /></Protected>} />)}
    <Route path="/fnguide" element={<Protected><FnGuideList /></Protected>} />
    <Route path="/admin-console" element={<Protected><AdminConsole /></Protected>} />
    <Route path="/search-new" element={<Protected><SearchPageNew /></Protected>} />
    <Route path="/notifications" element={<Protected><NotificationsPage /></Protected>} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>;
}
