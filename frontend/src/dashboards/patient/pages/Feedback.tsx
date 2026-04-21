import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components';
import StarRating from '../components/StarRating';
import { feedbackApi, appointmentsApi } from '../services/api';
import { FeedbackHistory, Appointment } from '../types';
import { format, differenceInHours } from 'date-fns';
import { showSuccessToast, showErrorToast } from '../utils/toast';

interface PendingFeedback extends Appointment {
  needsFeedback: boolean;
}

interface FeedbackFormData {
  rating: number;
  review: string;
  categories: string[];
}

const FEEDBACK_CATEGORIES = [
  { id: 'professionalism', label: 'Professionalism' },
  { id: 'communication', label: 'Communication' },
  { id: 'punctuality', label: 'Punctuality' },
  { id: 'cleanliness', label: 'Cleanliness' },
  { id: 'effectiveness', label: 'Effectiveness' },
];

const Feedback: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [pendingFeedback, setPendingFeedback] = useState<PendingFeedback[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<PendingFeedback | null>(null);
  const [formData, setFormData] = useState<FeedbackFormData>({
    rating: 0,
    review: '',
    categories: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<FeedbackHistory | null>(null);
  const [deletingFeedbackId, setDeletingFeedbackId] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedbackData();
  }, [activeTab]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'pending') {
        // Fetch completed appointments that need feedback
        const response = await appointmentsApi.getAppointments({
          status: 'completed',
        });
        const appointments = response.data.data.data || [];
        
        // Filter appointments that don't have feedback yet
        // In a real app, the backend would provide this information
        setPendingFeedback(
          appointments.map((apt: Appointment) => ({
            ...apt,
            needsFeedback: true,
          }))
        );
      } else {
        // Fetch feedback history
        const response = await feedbackApi.getFeedback();
        const history = response.data.data || [];
        
        // Map to FeedbackHistory format with editable flag
        setFeedbackHistory(
          history.map((item: any) => ({
            id: item.id,
            date: new Date(item.createdAt || item.date),
            provider: item.provider?.name || item.providerName,
            rating: item.rating,
            review: item.review,
            editable: differenceInHours(new Date(), new Date(item.createdAt || item.date)) < 48,
          }))
        );
      }
    } catch (err: any) {
      console.error('Error fetching feedback data:', err);
      setError('Failed to load feedback data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProvideFeedback = (appointment: PendingFeedback) => {
    setSelectedAppointment(appointment);
    setFormData({
      rating: 0,
      review: '',
      categories: [],
    });
  };

  const handleCancelFeedback = () => {
    setSelectedAppointment(null);
    setFormData({
      rating: 0,
      review: '',
      categories: [],
    });
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((c) => c !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAppointment) return;

    if (formData.rating === 0) {
      showErrorToast('Please provide a rating');
      return;
    }

    if (formData.review.trim().length < 10) {
      showErrorToast('Please provide a review with at least 10 characters');
      return;
    }

    try {
      setSubmitting(true);

      await feedbackApi.submitFeedback({
        appointmentId: selectedAppointment.id,
        rating: formData.rating,
        review: formData.review,
        categories: formData.categories,
      });

      showSuccessToast('Feedback submitted successfully');
      setSelectedAppointment(null);
      setFormData({
        rating: 0,
        review: '',
        categories: [],
      });
      fetchFeedbackData();
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      showErrorToast('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditFeedback = (feedback: FeedbackHistory) => {
    if (!feedback.editable) {
      showErrorToast('This feedback can no longer be edited (48 hour limit exceeded)');
      return;
    }
    setEditingFeedback(feedback);
    setFormData({
      rating: feedback.rating,
      review: feedback.review,
      categories: [], // Categories would need to be stored in the feedback object
    });
  };

  const handleUpdateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingFeedback) return;

    if (formData.rating === 0) {
      showErrorToast('Please provide a rating');
      return;
    }

    if (formData.review.trim().length < 10) {
      showErrorToast('Please provide a review with at least 10 characters');
      return;
    }

    try {
      setSubmitting(true);

      await feedbackApi.updateFeedback(editingFeedback.id, {
        rating: formData.rating,
        review: formData.review,
        categories: formData.categories,
      });

      showSuccessToast('Feedback updated successfully');
      setEditingFeedback(null);
      setFormData({
        rating: 0,
        review: '',
        categories: [],
      });
      fetchFeedbackData();
    } catch (err: any) {
      console.error('Error updating feedback:', err);
      showErrorToast('Failed to update feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    const feedback = feedbackHistory.find((f) => f.id === feedbackId);
    if (!feedback?.editable) {
      showErrorToast('This feedback can no longer be deleted (48 hour limit exceeded)');
      return;
    }

    setDeletingFeedbackId(feedbackId);
  };

  const confirmDeleteFeedback = async () => {
    if (!deletingFeedbackId) return;

    try {
      await feedbackApi.deleteFeedback(deletingFeedbackId);
      showSuccessToast('Feedback deleted successfully');
      setDeletingFeedbackId(null);
      fetchFeedbackData();
    } catch (err: any) {
      console.error('Error deleting feedback:', err);
      showErrorToast('Failed to delete feedback. Please try again.');
    }
  };

  const cancelDeleteFeedback = () => {
    setDeletingFeedbackId(null);
  };

  const renderPendingFeedback = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (pendingFeedback.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 text-lg font-medium">No pending feedback</p>
          <p className="text-gray-400 text-sm mt-2">
            Complete a consultation to provide feedback
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {pendingFeedback.map((appointment) => (
          <div
            key={appointment.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <img
                  src={appointment.provider.photo || '/default-avatar.png'}
                  alt={appointment.provider.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {appointment.provider.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {appointment.provider.specialty || appointment.provider.type}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {format(new Date(appointment.date), 'MMM dd, yyyy')}
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {appointment.time}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleProvideFeedback(appointment)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Provide Feedback
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFeedbackHistory = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (feedbackHistory.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 text-lg font-medium">No feedback history</p>
          <p className="text-gray-400 text-sm mt-2">
            Your submitted feedback will appear here
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {feedbackHistory.map((feedback) => (
          <div
            key={feedback.id}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {feedback.provider}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(feedback.date), 'MMMM dd, yyyy')}
                </p>
              </div>
              <StarRating value={feedback.rating} readonly size="md" />
            </div>
            <p className="text-gray-700 mb-4">{feedback.review}</p>
            {feedback.editable && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  You can edit or delete this feedback within 48 hours
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditFeedback(feedback)}
                    className="px-3 py-1.5 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteFeedback(feedback.id)}
                    className="px-3 py-1.5 text-sm border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
            {!feedback.editable && (
              <div className="pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-400">
                  This feedback can no longer be edited (48 hour limit exceeded)
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
        <p className="text-gray-600 mt-2">
          Share your experience and help improve our services
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'pending'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Feedback
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Feedback History
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'pending' ? renderPendingFeedback() : renderFeedbackHistory()}

      {/* Feedback Form Modal (New Feedback) */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Provide Feedback</h3>
              <button
                onClick={handleCancelFeedback}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="p-6">
              {/* Provider Info */}
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
                <img
                  src={selectedAppointment.provider.photo || '/default-avatar.png'}
                  alt={selectedAppointment.provider.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {selectedAppointment.provider.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedAppointment.provider.specialty || selectedAppointment.provider.type}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(selectedAppointment.date), 'MMMM dd, yyyy')} at{' '}
                    {selectedAppointment.time}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Overall Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-4">
                  <StarRating
                    value={formData.rating}
                    onChange={(rating) => setFormData({ ...formData, rating })}
                    size="lg"
                  />
                  {formData.rating > 0 && (
                    <span className="text-lg font-medium text-gray-700">
                      {formData.rating} / 5
                    </span>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What did you like? (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {FEEDBACK_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.categories.includes(category.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Share your experience with this provider..."
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Minimum 10 characters ({formData.review.length}/10)
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancelFeedback}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Feedback Modal */}
      {editingFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Edit Feedback</h3>
              <button
                onClick={() => setEditingFeedback(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateFeedback} className="p-6">
              {/* Provider Info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900">
                  {editingFeedback.provider}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(editingFeedback.date), 'MMMM dd, yyyy')}
                </p>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Overall Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-4">
                  <StarRating
                    value={formData.rating}
                    onChange={(rating) => setFormData({ ...formData, rating })}
                    size="lg"
                  />
                  {formData.rating > 0 && (
                    <span className="text-lg font-medium text-gray-700">
                      {formData.rating} / 5
                    </span>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What did you like? (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {FEEDBACK_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.categories.includes(category.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Share your experience with this provider..."
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Minimum 10 characters ({formData.review.length}/10)
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingFeedback(null)}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Feedback'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingFeedbackId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Delete Feedback
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this feedback? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelDeleteFeedback}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFeedback}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Feedback;
