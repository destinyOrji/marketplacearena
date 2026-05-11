import React from 'react';
import NotificationsPage from '../../../components/NotificationsPage';

const Notifications: React.FC = () => (
  <NotificationsPage
    tokenKey="gymPhysioToken"
    backPath="/gym-physio/dashboard"
    dashboardName="Gym & Physio Dashboard"
  />
);

export default Notifications;
