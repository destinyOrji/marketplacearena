// Dashboard Home Page

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardStats } from '../types';
import { analyticsApi } from '../services/api';
import { formatCurrency, formatResponseTime } from '../utils';

const DashboardHome: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await analyticsApi.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Emergency Services Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link
          to="/emergency/earnings"
          className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-sm p-6 text-white hover:shadow-lg transition-shadow"
        >
          <h3 className="text-sm font-medium opacity-90 mb-2">Total Earnings</h3>
          <p className="text-3xl font-bold">{formatCurrency(stats?.totalEarnings || 0)}</p>
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Emergencies</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.totalEmergencies || 0}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Response Time</h3>
          <p className="text-3xl font-bold text-gray-900">
            {formatResponseTime(stats?.averageResponseTime || 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Completion Rate</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.completionRate || 0}%</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Average Rating</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.averageRating?.toFixed(1) || '0.0'}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl shadow-sm p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">Pending Payments</h3>
          <p className="text-3xl font-bold">{formatCurrency(stats?.pendingPayments || 0)}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/emergency/services"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <span className="text-2xl">🚑</span>
            <span className="font-medium">Manage Services</span>
          </Link>
          <Link
            to="/emergency/coverage"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <span className="text-2xl">🗺️</span>
            <span className="font-medium">Coverage Areas</span>
          </Link>
          <Link
            to="/emergency/vehicles"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <span className="text-2xl">🚗</span>
            <span className="font-medium">Vehicles & Equipment</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
