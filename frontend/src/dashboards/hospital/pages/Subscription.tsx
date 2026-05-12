import React from 'react';
import ProviderSubscription from '../../../components/ProviderSubscription';

const HospitalSubscription: React.FC = () => (
  <ProviderSubscription
    role="hospital"
    tokenKey="hospitalToken"
    dashboardPath="/hospital/dashboard"
    title="Hospital Subscription Plans"
    description="Subscribe to post job vacancies, manage applications, and connect with healthcare professionals. All prices in Nigerian Naira (₦)."
  />
);

export default HospitalSubscription;
