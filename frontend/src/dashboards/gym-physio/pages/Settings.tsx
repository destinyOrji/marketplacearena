import React from 'react';

const Settings: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Notification Preferences</h2>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="w-5 h-5 text-orange-600 rounded" defaultChecked />
              <span className="ml-3 text-gray-700">Email notifications</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="w-5 h-5 text-orange-600 rounded" defaultChecked />
              <span className="ml-3 text-gray-700">SMS notifications</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="w-5 h-5 text-orange-600 rounded" defaultChecked />
              <span className="ml-3 text-gray-700">In-app notifications</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Change Password</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
