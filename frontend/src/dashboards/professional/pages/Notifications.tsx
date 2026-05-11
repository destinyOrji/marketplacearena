import React from 'react';
import NotificationsPage from '../../../components/NotificationsPage';

const Notifications: React.FC = () => (
  <NotificationsPage
    tokenKey="professionalToken"
    backPath="/professional/dashboard"
    dashboardName="Professional Dashboard"
  />
);

export default Notifications;
