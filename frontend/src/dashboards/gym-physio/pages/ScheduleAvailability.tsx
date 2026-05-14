import React, { useState, useEffect } from 'react';
import { getSchedule, updateSchedule, getBlockedDates, blockDate, unblockDate } from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const ScheduleAvailability: React.FC = () => {
  const [schedule, setSchedule] = useState<any>({});
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [newBlock, setNewBlock] = useState({ date: '', reason: '' });

  useEffect(() => {
    Promise.all([
      getSchedule().then(d => setSchedule(d || {})).catch(() => {}),
      getBlockedDates().then(d => setBlockedDates(Array.isArray(d) ? d : [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const handleToggleDay = (day: string) => {
    setSchedule((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isAvailable: !prev[day]?.isAvailable,
        timeSlots: prev[day]?.timeSlots || [{ startTime: '09:00', endTime: '17:00' }],
      },
    }));
  };

  const handleTimeChange = (day: string, index: number, field: 'startTime' | 'endTime', value: string) => {
    setSchedule((prev: any) => {
      const slots = [...(prev[day]?.timeSlots || [])];
      slots[index] = { ...slots[index], [field]: value };
      return { ...prev, [day]: { ...prev[day], timeSlots: slots } };
    });
  };

  const handleAddSlot = (day: string) => {
    setSchedule((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: [...(prev[day]?.timeSlots || []), { startTime: '09:00', endTime: '17:00' }],
      },
    }));
  };

  const handleRemoveSlot = (day: string, index: number) => {
    setSchedule((prev: any) => {
      const slots = prev[day]?.timeSlots?.filter((_: any, i: number) => i !== index) || [];
      return { ...prev, [day]: { ...prev[day], timeSlots: slots } };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSchedule(schedule);
      toast.success('Schedule saved successfully');
    } catch { toast.error('Failed to save schedule'); }
    finally { setSaving(false); }
  };

  const handleBlockDate = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newBlock.date || !newBlock.reason) { toast.error('Please fill all fields'); return; }
    try {
      const blocked = await blockDate(newBlock.date, newBlock.reason);
      setBlockedDates(prev => [...prev, blocked]);
      setShowBlockModal(false);
      setNewBlock({ date: '', reason: '' });
      toast.success('Date blocked');
    } catch { toast.error('Failed to block date'); }
  };

  const handleUnblock = async (id: string) => {
    if (!window.confirm('Unblock this date?')) return;
    try {
      await unblockDate(id);
      setBlockedDates(prev => prev.filter((d: any) => (d._id || d.id) !== id));
      toast.success('Date unblocked');
    } catch { toast.error('Failed to unblock date'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
    </div>
  );

  const inputClass = "px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500";

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Schedule & Availability</h1>
        <p className="text-gray-600">Manage your working hours and blocked dates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Schedule - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Weekly Schedule</h2>
              <p className="text-sm text-gray-500 mt-1">Set your available hours for each day</p>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm transition-colors">
              {saving ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>

          <div className="space-y-3">
            {DAYS.map(day => {
              const d = schedule[day] || { isAvailable: false, timeSlots: [] };
              return (
                <div key={day} className={`border rounded-lg p-4 transition-all ${d.isAvailable ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={d.isAvailable} onChange={() => handleToggleDay(day)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                      <span className="font-semibold text-gray-900 capitalize text-base">{day}</span>
                      {!d.isAvailable && (
                        <span className="text-xs text-gray-500 ml-2">(Unavailable)</span>
                      )}
                    </div>
                    {d.isAvailable && (
                      <button onClick={() => handleAddSlot(day)} className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Slot
                      </button>
                    )}
                  </div>

                  {d.isAvailable && d.timeSlots?.length > 0 && (
                    <div className="mt-3 space-y-2 sm:ml-14">
                      {d.timeSlots.map((slot: any, i: number) => (
                        <div key={i} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex-1">
                              <input type="time" value={slot.startTime} onChange={e => handleTimeChange(day, i, 'startTime', e.target.value)} 
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500" 
                                style={{ minHeight: '44px' }} />
                            </div>
                            <span className="text-gray-500 text-sm font-medium px-1">to</span>
                            <div className="flex-1">
                              <input type="time" value={slot.endTime} onChange={e => handleTimeChange(day, i, 'endTime', e.target.value)} 
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500" 
                                style={{ minHeight: '44px' }} />
                            </div>
                          </div>
                          {d.timeSlots.length > 1 && (
                            <button onClick={() => handleRemoveSlot(day, i)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors self-center sm:self-auto" title="Remove time slot">
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

        {/* Blocked Dates - Takes 1 column */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Blocked Dates</h2>
              <p className="text-sm text-gray-500 mt-1">Days you're unavailable</p>
            </div>
            <button onClick={() => setShowBlockModal(true)}
              className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium transition-colors"
              title="Block a date">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {blockedDates.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-gray-100 rounded-full">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-500 text-sm">No blocked dates</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {blockedDates.map((b: any) => {
                const id = b._id || b.id;
                return (
                  <div key={id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm mb-1">
                          {b.date ? format(new Date(b.date), 'MMMM dd, yyyy') : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-600 break-words">{b.reason}</p>
                      </div>
                      <button onClick={() => handleUnblock(id)}
                        className="flex-shrink-0 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Unblock date">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Block Date Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Block Date</h3>
            <form onSubmit={handleBlockDate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input type="date" value={newBlock.date} onChange={e => setNewBlock(p => ({ ...p, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea rows={3} value={newBlock.reason} onChange={e => setNewBlock(p => ({ ...p, reason: e.target.value }))}
                  placeholder="e.g. Vacation, Holiday, Personal time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowBlockModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium transition-colors">
                  Block Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleAvailability;
