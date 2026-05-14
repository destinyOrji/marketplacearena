import React from 'react';
import NotificationsPage from '../../../components/NotificationsPage';

const Notifications: React.FC = () => (
  <NotificationsPage
    tokenKey="admin_access_token"
    backPath="/admin/overview"
    dashboardName="Admin Dashboard"
  />
);

export default Notifications;
