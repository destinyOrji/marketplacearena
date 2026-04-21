/**
 * Professional Schedules View
 * Display professional availability calendar and scheduled appointments
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiCalendar } from 'react-icons/fi';
import { professionalService } from '../../services/professionalService';
import { ProfessionalSchedule } from '../../types';

const ProfessionalSchedules: React.FC = () => {
  const { professionalId } = useParams<{ professionalId: string }>();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<ProfessionalSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (professionalId) {
      // Set default date range (current week)
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      
      setStartDate(weekStart.toISOString().split('T')[0]);
      setEndDate(weekEnd.toISOString().split('T')[0]);
    }
  }, [professionalId]);

  useEffect(() => {
    if (professionalId && startDate && endDate) {
      fetchSchedules();
    }
  }, [professionalId, startDate, endDate]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await professionalService.getProfessionalSchedules(
        professionalId!,
        {
          start_date: startDate,
          end_date: endDate
        }
      );
      setSchedules(data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupSchedulesByDate = () => {
    const grouped: { [key: string]: ProfessionalSchedule[] } = {};
    
    schedules.forEach((schedule) => {
      const date = schedule.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(schedule);
    });

    return grouped;
  };

  const getStatusColor = (schedule: ProfessionalSchedule) => {
    if (schedule.appointment_id) {
      switch (schedule.appointment_status?.toLowerCase()) {
        case 'scheduled':
          return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'completed':
          return 'bg-green-100 text-green-800 border-green-300';
        case 'cancelled':
          return 'bg-red-100 text-red-800 border-red-300';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    }
    return schedule.is_available
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const groupedSchedules = groupSchedulesByDate();
  const sortedDates = Object.keys(groupedSchedules).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/admin/professionals/${professionalId}`)}
            className="text-gray-600 hover:text-gray-900"
          >
            <FiChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Professional Schedules</h1>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Schedules Calendar View */}
      {sortedDates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FiCalendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No schedules found for the selected date range.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupedSchedules[date]
                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                  .map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`p-4 rounded-lg border-2 ${getStatusColor(schedule)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">
                          {schedule.start_time} - {schedule.end_time}
                        </span>
                        {schedule.appointment_id && (
                          <span className="text-xs px-2 py-1 bg-white rounded-full">
                            Appointment #{schedule.appointment_id}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs">
                        {schedule.appointment_id ? (
                          <span>
                            Status: {schedule.appointment_status ? 
                              schedule.appointment_status.charAt(0).toUpperCase() + schedule.appointment_status.slice(1) : 
                              'Unknown'}
                          </span>
                        ) : (
                          <span>
                            {schedule.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-50 border-2 border-green-200 rounded"></div>
            <span className="text-xs text-gray-700">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 rounded"></div>
            <span className="text-xs text-gray-700">Unavailable</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
            <span className="text-xs text-gray-700">Scheduled</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
            <span className="text-xs text-gray-700">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
            <span className="text-xs text-gray-700">Cancelled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalSchedules;
