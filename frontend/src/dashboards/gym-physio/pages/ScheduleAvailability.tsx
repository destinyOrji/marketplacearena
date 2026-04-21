import React from 'react';

const ScheduleAvailability: React.FC = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Schedule & Availability</h1>

      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-600 mb-6">Set your weekly availability schedule</p>
        
        <div className="space-y-4">
          {days.map((day) => (
            <div key={day} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <input type="checkbox" className="w-5 h-5 text-orange-600 rounded" />
                <span className="font-medium text-gray-900">{day}</span>
              </div>
              <div className="flex items-center space-x-4">
                <input type="time" className="px-3 py-2 border border-gray-300 rounded-lg" defaultValue="09:00" />
                <span className="text-gray-600">to</span>
                <input type="time" className="px-3 py-2 border border-gray-300 rounded-lg" defaultValue="17:00" />
              </div>
            </div>
          ))}
        </div>

        <button className="mt-6 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
          Save Schedule
        </button>
      </div>
    </div>
  );
};

export default ScheduleAvailability;
