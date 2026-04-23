import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props { data: any[]; }

const EmergencyBookingsChart: React.FC<Props> = ({ data }) => {
  const hasData = data && data.length > 0 && data.some(d => (d.bookings || 0) > 0);

  if (!hasData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Bookings</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          <div className="text-center">
            <p className="text-4xl mb-2">🚑</p>
            <p className="text-sm">No emergency booking data yet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Bookings</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="bookings" stroke="#f59e0b" fill="#fef3c7" name="Total Bookings" />
          <Area type="monotone" dataKey="completed" stroke="#10b981" fill="#d1fae5" name="Completed" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmergencyBookingsChart;
