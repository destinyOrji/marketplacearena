import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props { data: any[]; }

const AppointmentStatsChart: React.FC<Props> = ({ data }) => {
  const hasData = data && data.length > 0 && data.some(d => (d.scheduled || 0) + (d.completed || 0) + (d.cancelled || 0) > 0);

  if (!hasData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Statistics</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          <div className="text-center">
            <p className="text-4xl mb-2">📅</p>
            <p className="text-sm">No appointment data yet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Statistics</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="scheduled" fill="#3b82f6" name="Scheduled" radius={[4, 4, 0, 0]} />
          <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
          <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AppointmentStatsChart;
