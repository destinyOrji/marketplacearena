// Dashboard Layout Component

import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ErrorBoundary from './ErrorBoundary';
import { EmergencyProvider } from '../types';
import { profileApi, availabilityApi } from '../services/api';
import websocketService from '../services/websocket';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [provider, setProvider] = useState<EmergencyProvider | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProvider();
    initializeWebSocket();

    return () => {
      websocketService.disconnect();
    };
  }, []);

  const fetchProvider = async () => {
    try {
      const data = await profileApi.getProfile();
      setProvider(data);
      setIsAvailable(data.isAvailable);
    } catch (error) {
      console.error('Error fetching provider:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeWebSocket = () => {
    const token = localStorage.getItem('emergency_token');
    if (token) {
      websocketService.connect(token);
    }
  };

  const handleToggleAvailability = async (available: boolean) => {
    try {
      await availabilityApi.setAvailability(available);
      websocketService.setAvailability(available);
      setIsAvailable(available);
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        provider={provider}
      />

      <div className="flex-1 flex flex-col lg:pl-64">
        <Header
          provider={provider}
          isAvailable={isAvailable}
          onToggleAvailability={handleToggleAvailability}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto">
          <React.Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            }
          >
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </React.Suspense>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
