/**
 * Emergency Bookings Chart Component
 * Area chart showing emergency booking trends
 */
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { EmergencyStats } from '../../types/dashboard';

interface EmergencyBookingsChartProps {
  data: EmergencyStats[];
}

const EmergencyBookingsChart: React.FC<EmergencyBookingsChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Bookings</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="bookings"
            stackId="1"
            stroke="#f59e0b"
            fill="#fbbf24"
            name="Total Bookings"
          />
          <Area
            type="monotone"
            dataKey="completed"
            stackId="2"
            stroke="#10b981"
            fill="#34d399"
            name="Completed"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmergencyBookingsChart;
