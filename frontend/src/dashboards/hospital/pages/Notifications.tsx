import React from 'react';
import NotificationsPage from '../../../components/NotificationsPage';

const Notifications: React.FC = () => (
  <NotificationsPage
    tokenKey="hospitalToken"
    backPath="/hospital/dashboard"
    dashboardName="Hospital Dashboard"
  />
);

export default Notifications;
