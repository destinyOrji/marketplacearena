 import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components';
import { appointmentsApi, paymentsApi } from '../services/api';
import { Appointment, Payment } from '../types';
import { format } from 'date-fns';

interface DashboardStats {
  upcomingAppointments: number;
  pendingPayments: number;
}

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscription: {
    plan: string;
    endDate: string;
    status: string;
  } | null;
  daysRemaining: number;
}

const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    pendingPayments: 0,
  });
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [upcomingConsultations, setUpcomingConsultations] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch subscription status
      const token = localStorage.getItem('authToken');
      const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';
      const subResponse = await fetch(`${API_URL}/subscriptions/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const subData = await subResponse.json();
      if (subData.success) {
        setSubscriptionStatus(subData.data);
      }

      // Fetch upcoming appointments
      const appointmentsResponse = await appointmentsApi.getAppointments({
        status: 'upcoming',
        limit: 5,
      });
      const apptData = appointmentsResponse.data?.data ?? appointmentsResponse.data ?? [];
      const appointments = Array.isArray(apptData) ? apptData : [];
      
      // Fetch pending payments
      const paymentsResponse = await paymentsApi.getPayments({ status: 'pending' });
      const payData = paymentsResponse.data?.data ?? paymentsResponse.data ?? [];
      const payments = Array.isArray(payData) ? payData : [];

      setStats({
        upcomingAppointments: appointments.length,
        pendingPayments: payments.length,
      });
      setUpcomingConsultations(appointments);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookConsultation = () => {
    navigate('/patient/browse-services');
  };

  const handleCallAmbulance = () => {
    navigate('/patient/emergency');
  };

  const handleViewAppointment = (appointmentId: string) => {
    navigate(`/patient/appointments/${appointmentId}`);
  };

  return (
    <DashboardLayout>
      {/* Welcome Message */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {(user as any)?.firstName || user?.fullName || 'Patient'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your healthcare activities
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Subscription Status Banner */}
      {subscriptionStatus && !subscriptionStatus.hasActiveSubscription && (
        <div className="mb-6 bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="bg-yellow-400 rounded-full p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-yellow-900 mb-1">
                  Subscription Required
                </h3>
                <p className="text-yellow-800 text-sm mb-3">
                  Subscribe now to book appointments and access emergency services
                </p>
                <button
                  onClick={() => navigate('/patient/subscription')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  View Plans & Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {subscriptionStatus && subscriptionStatus.hasActiveSubscription && (
        <div className="mb-6 bg-green-50 border-2 border-green-400 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="bg-green-500 rounded-full p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-900 mb-1">
                  Active Subscription
                </h3>
                <p className="text-green-800 text-sm">
                  Plan: <span className="font-semibold">{subscriptionStatus.subscription?.plan}</span> • 
                  {subscriptionStatus.daysRemaining > 0 ? (
                    <> {subscriptionStatus.daysRemaining} days remaining</>
                  ) : (
                    <> Expires today</>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/patient/subscription')}
              className="text-green-700 hover:text-green-900 text-sm font-medium"
            >
              Manage →
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Upcoming Appointments Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Upcoming Appointments</p>
              <p className="text-4xl font-bold mt-2">
                {loading ? '...' : stats.upcomingAppointments}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <button
            onClick={() => navigate('/patient/appointments')}
            className="mt-4 text-sm text-blue-100 hover:text-white transition-colors"
          >
            View all appointments →
          </button>
        </div>

        {/* Pending Payments Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Pending Payments</p>
              <p className="text-4xl font-bold mt-2">
                {loading ? '...' : stats.pendingPayments}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
          </div>
          <button
            onClick={() => navigate('/patient/payments')}
            className="mt-4 text-sm text-green-100 hover:text-white transition-colors"
          >
            View payment history →
          </button>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={handleBookConsultation}
          className="bg-white border-2 border-blue-600 text-blue-600 rounded-xl shadow-md p-6 hover:bg-blue-50 transition-colors flex items-center justify-between group"
        >
          <div className="text-left">
            <h3 className="text-lg font-semibold">Book Consultation</h3>
            <p className="text-sm text-gray-600 mt-1">
              Schedule an appointment with a healthcare professional
            </p>
          </div>
          <svg
            className="w-6 h-6 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <button
          onClick={handleCallAmbulance}
          className="bg-red-600 text-white rounded-xl shadow-md p-6 hover:bg-red-700 transition-colors flex items-center justify-between group"
        >
          <div className="text-left">
            <h3 className="text-lg font-semibold">Call Ambulance</h3>
            <p className="text-sm text-red-100 mt-1">
              Request emergency medical transportation
            </p>
          </div>
          <svg
            className="w-6 h-6 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </button>
      </div>

      {/* Upcoming Consultations */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Consultations</h2>
          <button
            onClick={() => navigate('/patient/appointments')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View all
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : upcomingConsultations.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-500 text-lg font-medium">No upcoming consultations</p>
            <p className="text-gray-400 text-sm mt-2">
              Book a consultation to get started
            </p>
            <button
              onClick={handleBookConsultation}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingConsultations.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleViewAppointment(appointment.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <img
                      src={appointment.provider.photo || '/default-avatar.png'}
                      alt={appointment.provider.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {appointment.provider.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {appointment.provider.specialty || appointment.provider.type}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {format(new Date(appointment.date), 'MMM dd, yyyy')}
                        </span>
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {appointment.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.type === 'video'
                          ? 'bg-blue-100 text-blue-700'
                          : appointment.type === 'chat'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;
