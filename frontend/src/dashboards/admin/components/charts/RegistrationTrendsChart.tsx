import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props { data: any[]; }

const RegistrationTrendsChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Trends</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          <div className="text-center">
            <p className="text-4xl mb-2">📈</p>
            <p className="text-sm">No registration data yet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="hospitals" stroke="#8b5cf6" strokeWidth={2} name="Hospitals" dot={false} />
          <Line type="monotone" dataKey="professionals" stroke="#3b82f6" strokeWidth={2} name="Professionals" dot={false} />
          <Line type="monotone" dataKey="patients" stroke="#10b981" strokeWidth={2} name="Patients" dot={false} />
          <Line type="monotone" dataKey="ambulances" stroke="#f59e0b" strokeWidth={2} name="Ambulances" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RegistrationTrendsChart;
