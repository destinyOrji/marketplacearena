import React from 'react';
import NotificationsPage from '../../../components/NotificationsPage';

const Notifications: React.FC = () => (
  <NotificationsPage
    tokenKey="ambulanceToken"
    backPath="/ambulance/dashboard"
    dashboardName="Ambulance Dashboard"
  />
);

export default Notifications;
