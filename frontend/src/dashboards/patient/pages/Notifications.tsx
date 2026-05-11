import React from 'react';
import NotificationsPage from '../../../components/NotificationsPage';

const Notifications: React.FC = () => (
  <NotificationsPage
    tokenKey="authToken"
    backPath="/patient/dashboard"
    dashboardName="Patient Dashboard"
  />
);

export default Notifications;
