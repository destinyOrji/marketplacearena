import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components';
import { medicalRecordsApi } from '../services/api';
import { MedicalRecord, Prescription } from '../types';
import { format } from 'date-fns';
import { showSuccessToast, showErrorToast, showInfoToast } from '../utils/toast';

interface PrescriptionModalProps {
  isOpen: boolean;
  prescription: Prescription[] | null;
  recordDate: Date | null;
  providerName: string | null;
  onClose: () => void;
  onDownload: () => void;
}

const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  prescription,
  recordDate,
  providerName,
  onClose,
  onDownload,
}) => {
  if (!isOpen || !prescription) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Prescription Details</h3>
            {recordDate && providerName && (
              <p className="text-sm text-gray-600 mt-1">
                {format(new Date(recordDate), 'MMMM dd, yyyy')} • {providerName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {prescription.map((med, index) => (
              <div
                key={index}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4"
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  {med.medication}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">Dosage:</span>
                    <p className="text-gray-900 mt-1">{med.dosage}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Frequency:</span>
                    <p className="text-gray-900 mt-1">{med.frequency}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Duration:</span>
                    <p className="text-gray-900 mt-1">{med.duration}</p>
                  </div>
                </div>
                {med.instructions && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-gray-600 font-medium text-sm">Instructions:</span>
                    <p className="text-gray-900 text-sm mt-1">{med.instructions}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onDownload}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Prescription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MedicalRecords: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProvider, setFilterProvider] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [prescriptionModal, setPrescriptionModal] = useState<{
    isOpen: boolean;
    prescription: Prescription[] | null;
    recordDate: Date | null;
    providerName: string | null;
  }>({ isOpen: false, prescription: null, recordDate: null, providerName: null });

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [records, searchQuery, filterProvider, filterDateFrom, filterDateTo]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await medicalRecordsApi.getRecords();
      const recordsData = response.data?.data ?? response.data ?? [];
      setRecords(Array.isArray(recordsData) ? recordsData : []);
    } catch (err: any) {
      console.error('Error fetching medical records:', err);
      setError('Failed to load medical records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.diagnosis.toLowerCase().includes(query) ||
          record.provider.toLowerCase().includes(query) ||
          record.notes.toLowerCase().includes(query)
      );
    }

    // Provider filter
    if (filterProvider) {
      filtered = filtered.filter((record) =>
        record.provider.toLowerCase().includes(filterProvider.toLowerCase())
      );
    }

    // Date range filter
    if (filterDateFrom) {
      filtered = filtered.filter(
        (record) => new Date(record.date) >= new Date(filterDateFrom)
      );
    }
    if (filterDateTo) {
      filtered = filtered.filter(
        (record) => new Date(record.date) <= new Date(filterDateTo)
      );
    }

    setFilteredRecords(filtered);
  };

  const toggleRecordExpansion = (recordId: string) => {
    setExpandedRecordId(expandedRecordId === recordId ? null : recordId);
  };

  const handleViewPrescription = (record: MedicalRecord) => {
    setPrescriptionModal({
      isOpen: true,
      prescription: record.prescription,
      recordDate: record.date,
      providerName: record.provider,
    });
  };

  const handleDownloadRecord = async (recordId: string) => {
    try {
      showInfoToast('Downloading medical record...');
      const response = await medicalRecordsApi.downloadRecord(recordId);
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `medical-record-${recordId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccessToast('Medical record downloaded successfully');
    } catch (err: any) {
      console.error('Error downloading medical record:', err);
      showErrorToast('Failed to download medical record. Please try again.');
    }
  };

  const handleDownloadPrescription = () => {
    showInfoToast('Downloading prescription...');
    // In a real implementation, this would download the prescription PDF
    showSuccessToast('Prescription downloaded successfully');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterProvider('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const getUniqueProviders = () => {
    const providers = records.map((record) => record.provider);
    return Array.from(new Set(providers)).sort();
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
        <p className="text-gray-600 mt-2">
          View your complete medical history and prescriptions
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by diagnosis, provider, or notes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Provider Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provider
            </label>
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Providers</option>
              {getUniqueProviders().map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Records Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredRecords.length === 0 ? (
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
          <p className="text-gray-500 text-lg font-medium">
            {records.length === 0 ? 'No medical records found' : 'No records match your filters'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {records.length === 0
              ? 'Your medical records will appear here after consultations'
              : 'Try adjusting your search or filter criteria'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record, index) => {
            const isExpanded = expandedRecordId === record.id;
            const isLast = index === filteredRecords.length - 1;

            return (
              <div key={record.id} className="relative">
                {/* Timeline Line */}
                {!isLast && (
                  <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200 -mb-4"></div>
                )}

                <div className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => toggleRecordExpansion(record.id)}
                  >
                    <div className="flex items-start">
                      {/* Timeline Dot */}
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <svg
                          className="w-6 h-6 text-blue-600"
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
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {record.diagnosis}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {record.provider}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {format(new Date(record.date), 'MMMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <svg
                              className={`w-5 h-5 text-gray-400 transition-transform ${
                                isExpanded ? 'transform rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-6 pl-16 space-y-4">
                        {/* Notes */}
                        {record.notes && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                              Notes
                            </h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {record.notes}
                            </p>
                          </div>
                        )}

                        {/* Prescriptions */}
                        {record.prescription && record.prescription.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                              Prescriptions ({record.prescription.length})
                            </h4>
                            <div className="space-y-2">
                              {record.prescription.map((med, idx) => (
                                <div
                                  key={idx}
                                  className="bg-blue-50 border border-blue-100 p-3 rounded-lg"
                                >
                                  <p className="text-sm font-medium text-gray-900">
                                    {med.medication}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {med.dosage} • {med.frequency} • {med.duration}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Attachments */}
                        {record.attachments && record.attachments.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                              Attachments ({record.attachments.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {record.attachments.map((attachment, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
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
                                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                    />
                                  </svg>
                                  Attachment {idx + 1}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                          {record.prescription && record.prescription.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewPrescription(record);
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              View Prescription
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadRecord(record.id);
                            }}
                            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium flex items-center"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            Download Record
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Prescription Modal */}
      <PrescriptionModal
        isOpen={prescriptionModal.isOpen}
        prescription={prescriptionModal.prescription}
        recordDate={prescriptionModal.recordDate}
        providerName={prescriptionModal.providerName}
        onClose={() =>
          setPrescriptionModal({
            isOpen: false,
            prescription: null,
            recordDate: null,
            providerName: null,
          })
        }
        onDownload={handleDownloadPrescription}
      />
    </DashboardLayout>
  );
};

export default MedicalRecords;
