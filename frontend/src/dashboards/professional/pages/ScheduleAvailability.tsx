// Schedule & Availability Page - Manage working hours

import React, { useState, useEffect } from 'react';
import { WeeklySchedule, DaySchedule, TimeSlot, BlockedDate } from '../types';
import { scheduleApi } from '../services/api';
import { toast } from 'react-toastify';
import { format, addDays, startOfWeek } from 'date-fns';

const ScheduleAvailability: React.FC = () => {
  const [schedule, setSchedule] = useState<WeeklySchedule>({});
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBlockDateModal, setShowBlockDateModal] = useState(false);
  const [newBlockedDate, setNewBlockedDate] = useState({
    date: '',
    reason: '',
  });

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    fetchSchedule();
    fetchBlockedDates();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const data = await scheduleApi.getSchedule();
      setSchedule(data);
    } catch (error) {
      toast.error('Failed to load schedule');
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockedDates = async () => {
    try {
      const data = await scheduleApi.getBlockedDates();
      setBlockedDates(data);
    } catch (error) {
      console.error('Error fetching blocked dates:', error);
    }
  };

  const handleToggleDay = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        isAvailable: !schedule[day]?.isAvailable,
        timeSlots: schedule[day]?.timeSlots || [{ startTime: '09:00', endTime: '17:00' }],
      },
    });
  };

  const handleAddTimeSlot = (day: string) => {
    const daySchedule = schedule[day] || { isAvailable: true, timeSlots: [] };
    setSchedule({
      ...schedule,
      [day]: {
        ...daySchedule,
        timeSlots: [...daySchedule.timeSlots, { startTime: '09:00', endTime: '17:00' }],
      },
    });
  };

  const handleRemoveTimeSlot = (day: string, index: number) => {
    const daySchedule = schedule[day];
    if (!daySchedule) return;

    setSchedule({
      ...schedule,
      [day]: {
        ...daySchedule,
        timeSlots: daySchedule.timeSlots.filter((_, i) => i !== index),
      },
    });
  };

  const handleTimeSlotChange = (day: string, index: number, field: 'startTime' | 'endTime', value: string) => {
    const daySchedule = schedule[day];
    if (!daySchedule) return;

    const updatedSlots = [...daySchedule.timeSlots];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };

    setSchedule({
      ...schedule,
      [day]: {
        ...daySchedule,
        timeSlots: updatedSlots,
      },
    });
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      await scheduleApi.updateSchedule(schedule);
      toast.success('Schedule updated successfully');
    } catch (error) {
      toast.error('Failed to update schedule');
      console.error('Error updating schedule:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBlockDate = async () => {
    if (!newBlockedDate.date || !newBlockedDate.reason) {
      toast.error('Please provide both date and reason');
      return;
    }

    try {
      const blocked = await scheduleApi.blockDate(new Date(newBlockedDate.date), newBlockedDate.reason);
      setBlockedDates([...blockedDates, blocked]);
      setShowBlockDateModal(false);
      setNewBlockedDate({ date: '', reason: '' });
      toast.success('Date blocked successfully');
    } catch (error) {
      toast.error('Failed to block date');
      console.error('Error blocking date:', error);
    }
  };

  const handleUnblockDate = async (id: string) => {
    if (!window.confirm('Are you sure you want to unblock this date?')) return;

    try {
      await scheduleApi.unblockDate(id);
      setBlockedDates(blockedDates.filter((d) => d.id !== id));
      toast.success('Date unblocked successfully');
    } catch (error) {
      toast.error('Failed to unblock date');
      console.error('Error unblocking date:', error);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Schedule & Availability</h1>
        <p className="text-gray-600">Manage your working hours and availability</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Weekly Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Weekly Schedule</h2>
              <button
                onClick={handleSaveSchedule}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Schedule'}
              </button>
            </div>

            <div className="space-y-4">
              {daysOfWeek.map((day) => {
                const daySchedule = schedule[day] || { isAvailable: false, timeSlots: [] };
                return (
                  <div key={day} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={daySchedule.isAvailable}
                            onChange={() => handleToggleDay(day)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                        <span className="font-medium text-gray-900 capitalize">{day}</span>
                      </div>
                      {daySchedule.isAvailable && (
                        <button
                          onClick={() => handleAddTimeSlot(day)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          + Add Time Slot
                        </button>
                      )}
                    </div>

                    {daySchedule.isAvailable && (
                      <div className="space-y-2 ml-14">
                        {daySchedule.timeSlots.map((slot, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => handleTimeSlotChange(day, index, 'startTime', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <span className="text-gray-600">to</span>
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => handleTimeSlotChange(day, index, 'endTime', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {daySchedule.timeSlots.length > 1 && (
                              <button
                                onClick={() => handleRemoveTimeSlot(day, index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Blocked Dates */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Blocked Dates</h2>
              <button
                onClick={() => setShowBlockDateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Block Date
              </button>
            </div>

            {blockedDates.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No blocked dates</p>
            ) : (
              <div className="space-y-3">
                {blockedDates.map((blocked) => (
                  <div
                    key={blocked.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(new Date(blocked.date), 'MMMM dd, yyyy')}
                      </p>
                      <p className="text-sm text-gray-600">{blocked.reason}</p>
                    </div>
                    <button
                      onClick={() => handleUnblockDate(blocked.id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Block Date Modal */}
      {showBlockDateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Block Date</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={newBlockedDate.date}
                  onChange={(e) => setNewBlockedDate({ ...newBlockedDate, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason *
                </label>
                <textarea
                  value={newBlockedDate.reason}
                  onChange={(e) => setNewBlockedDate({ ...newBlockedDate, reason: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Vacation, Personal time, Conference"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBlockDateModal(false);
                  setNewBlockedDate({ date: '', reason: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockDate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Block Date
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleAvailability;
