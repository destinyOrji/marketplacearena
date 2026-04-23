import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props { data: any[]; }

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const RevenueDistributionChart: React.FC<Props> = ({ data }) => {
  const hasData = data && data.length > 0 && data.some(d => (d.amount || 0) > 0);

  if (!hasData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Distribution</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          <div className="text-center">
            <p className="text-4xl mb-2">💰</p>
            <p className="text-sm">No revenue data yet</p>
            <p className="text-xs mt-1 text-gray-300">Revenue will appear as transactions occur</p>
          </div>
        </div>
        {/* Show categories even with 0 values */}
        {data && data.length > 0 && (
          <div className="mt-4 space-y-2">
            {data.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-600">{item.source || item.category}</span>
                </div>
                <span className="font-medium text-gray-900">₦{(item.amount || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={90} dataKey="amount"
            label={({ source, percentage }) => `${source}: ${percentage}%`}
            labelLine={false}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, 'Amount']} />
          <Legend formatter={(value, entry: any) => entry.payload?.source || value} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueDistributionChart;
