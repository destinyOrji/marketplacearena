/**
 * Hospital Subscriptions View
 * Display subscription plan details and billing history
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiCreditCard, FiCalendar, FiDollarSign, FiFileText } from 'react-icons/fi';
import { Button, Modal } from '../../components';
import { hospitalService } from '../../services/hospitalService';
import { HospitalSubscription } from '../../types';

const HospitalSubscriptions: React.FC = () => {
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<HospitalSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateModal, setUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    plan_type: '',
    billing_cycle: ''
  });

  useEffect(() => {
    if (hospitalId) {
      fetchSubscription();
    }
  }, [hospitalId]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const data = await hospitalService.getHospitalSubscription(hospitalId!);
      setSubscription(data);
      if (data) {
        setUpdateForm({
          plan_type: data.plan_type,
          billing_cycle: data.billing_cycle
        });
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = () => {
    setUpdateModal(true);
  };

  const handleUpdateConfirm = async () => {
    try {
      await hospitalService.updateHospitalSubscription(hospitalId!, updateForm);
      setUpdateModal(false);
      fetchSubscription();
    } catch (error) {
      console.error('Failed to update subscription:', error);
      alert('Failed to update subscription. Please try again.');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/admin/hospitals/${hospitalId}`)}
            className="text-gray-600 hover:text-gray-900"
          >
            <FiChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Subscriptions</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FiCreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No active subscription found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/admin/hospitals/${hospitalId}`)}
            className="text-gray-600 hover:text-gray-900"
          >
            <FiChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Subscriptions</h1>
        </div>
        <Button variant="primary" onClick={handleUpdateClick}>
          Update Subscription
        </Button>
      </div>

      {/* Subscription Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Current Subscription</h3>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(subscription.status)}`}>
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Plan Name</p>
            <p className="text-base font-medium text-gray-900">{subscription.plan_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Plan Type</p>
            <p className="text-base font-medium text-gray-900">{subscription.plan_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Billing Cycle</p>
            <p className="text-base font-medium text-gray-900">{subscription.billing_cycle}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Amount</p>
            <p className="text-base font-medium text-gray-900">${subscription.amount.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="flex items-center space-x-3">
            <FiCalendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="text-base font-medium text-gray-900">
                {new Date(subscription.start_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <FiCalendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="text-base font-medium text-gray-900">
                {new Date(subscription.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          {subscription.next_billing_date && (
            <div className="flex items-center space-x-3">
              <FiDollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Next Billing Date</p>
                <p className="text-base font-medium text-gray-900">
                  {new Date(subscription.next_billing_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
        {subscription.payment_history.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No payment history available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscription.payment_history.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{payment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.payment_method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusBadgeClass(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment.invoice_url ? (
                        <a
                          href={payment.invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <FiFileText className="h-4 w-4 mr-1" />
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Subscription Modal */}
      <Modal
        isOpen={updateModal}
        onClose={() => setUpdateModal(false)}
        title="Update Subscription"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Type
            </label>
            <select
              value={updateForm.plan_type}
              onChange={(e) => setUpdateForm({ ...updateForm, plan_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Basic">Basic</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Cycle
            </label>
            <select
              value={updateForm.billing_cycle}
              onChange={(e) => setUpdateForm({ ...updateForm, billing_cycle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annually">Annually</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => setUpdateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateConfirm}>
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HospitalSubscriptions;
