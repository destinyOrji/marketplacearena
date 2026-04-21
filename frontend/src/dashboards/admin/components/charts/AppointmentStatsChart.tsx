/**
 * Appointment Statistics Chart Component
 * Bar chart showing appointment statistics
 */
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { AppointmentStats } from '../../types/dashboard';

interface AppointmentStatsChartProps {
  data: AppointmentStats[];
}

const AppointmentStatsChart: React.FC<AppointmentStatsChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Statistics</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="scheduled" fill="#3b82f6" name="Scheduled" />
          <Bar dataKey="completed" fill="#10b981" name="Completed" />
          <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AppointmentStatsChart;
