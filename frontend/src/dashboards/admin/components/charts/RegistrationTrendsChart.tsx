/**
 * Registration Trends Chart Component
 * Line chart showing registration trends over time
 */
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { RegistrationTrend } from '../../types/dashboard';

interface RegistrationTrendsChartProps {
  data: RegistrationTrend[];
}

const RegistrationTrendsChart: React.FC<RegistrationTrendsChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="hospitals"
            stroke="#8b5cf6"
            strokeWidth={2}
            name="Hospitals"
          />
          <Line
            type="monotone"
            dataKey="professionals"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Professionals"
          />
          <Line
            type="monotone"
            dataKey="patients"
            stroke="#10b981"
            strokeWidth={2}
            name="Patients"
          />
          <Line
            type="monotone"
            dataKey="ambulances"
            stroke="#f59e0b"
            strokeWidth={2}
            name="Ambulances"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RegistrationTrendsChart;
