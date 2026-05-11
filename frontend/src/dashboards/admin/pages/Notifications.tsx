import React from 'react';
import NotificationsPage from '../../../components/NotificationsPage';

const Notifications: React.FC = () => (
  <NotificationsPage
    tokenKey="adminToken"
    backPath="/admin/overview"
    dashboardName="Admin Dashboard"
  />
);

export default Notifications;
