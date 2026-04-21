/**
 * Recent Activities Component
 * Displays a feed of recent platform activities
 */
import React from 'react';
import { FiRefreshCw, FiUser, FiCheckCircle, FiTruck } from 'react-icons/fi';
import { RecentActivity } from '../types/dashboard';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivitiesProps {
  activities: RecentActivity[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({
  activities,
  onRefresh,
  isLoading = false
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'registration':
        return FiUser;
      case 'verification':
        return FiCheckCircle;
      case 'booking':
        return FiTruck;
      default:
        return FiUser;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'registration':
        return 'bg-blue-100 text-blue-600';
      case 'verification':
        return 'bg-green-100 text-green-600';
      case 'booking':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            <FiRefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No recent activities</p>
        ) : (
          activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);

            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`rounded-full p-2 ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.user.name}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentActivities;
