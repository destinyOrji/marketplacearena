/**
 * Recent Activities Component
 * Displays recent platform activities in a table
 */
import React from 'react';
import { FiRefreshCw, FiUser, FiCheckCircle, FiTruck, FiActivity } from 'react-icons/fi';
import { RecentActivity } from '../types/dashboard';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivitiesProps {
  activities: RecentActivity[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

const roleBadge: Record<string, string> = {
  client:       'bg-blue-100 text-blue-700',
  professional: 'bg-purple-100 text-purple-700',
  hospital:     'bg-green-100 text-green-700',
  ambulance:    'bg-red-100 text-red-700',
  'gym-physio': 'bg-orange-100 text-orange-700',
  admin:        'bg-gray-100 text-gray-700',
};

const roleLabel: Record<string, string> = {
  client:       'Patient',
  professional: 'Professional',
  hospital:     'Hospital',
  ambulance:    'Ambulance',
  'gym-physio': 'Gym/Physio',
  admin:        'Admin',
};

const typeIcon: Record<string, React.ReactNode> = {
  registration: <FiUser className="h-4 w-4" />,
  verification: <FiCheckCircle className="h-4 w-4" />,
  booking:      <FiTruck className="h-4 w-4" />,
};

const typeColor: Record<string, string> = {
  registration: 'bg-blue-100 text-blue-600',
  verification: 'bg-green-100 text-green-600',
  booking:      'bg-orange-100 text-orange-600',
};

const RecentActivities: React.FC<RecentActivitiesProps> = ({
  activities,
  onRefresh,
  isLoading = false,
}) => {
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <FiActivity className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
            title="Refresh"
          >
            <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Table */}
      {activities.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FiActivity className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No recent activities</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {activities.map((activity, i) => {
                const role = activity.user?.role || 'client';
                const badgeClass = roleBadge[role] || 'bg-gray-100 text-gray-700';
                const label = roleLabel[role] || role;
                const icon = typeIcon[activity.type] || <FiUser className="h-4 w-4" />;
                const iconColor = typeColor[activity.type] || 'bg-gray-100 text-gray-600';

                return (
                  <tr key={activity.id || i} className="hover:bg-gray-50 transition-colors">
                    {/* User */}
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(activity.user?.name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {activity.user?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-400">{activity.user?.email || ''}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                        {label}
                      </span>
                    </td>

                    {/* Activity description */}
                    <td className="px-6 py-3">
                      <p className="text-sm text-gray-700 max-w-xs truncate">
                        {activity.description}
                      </p>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${iconColor}`}>
                        {icon}
                        <span className="capitalize">{activity.type}</span>
                      </span>
                    </td>

                    {/* Time */}
                    <td className="px-6 py-3 whitespace-nowrap text-xs text-gray-400">
                      {formatTimestamp(activity.timestamp)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentActivities;
