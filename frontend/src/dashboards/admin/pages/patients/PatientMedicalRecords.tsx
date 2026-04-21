/**
 * Patient Medical Records View
 * Display patient medical records with document preview capability
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiFileText, FiDownload, FiEye } from 'react-icons/fi';
import DataTable, { Column } from '../../components/DataTable';
import { Modal } from '../../components';
import { patientService } from '../../services/patientService';
import { PatientMedicalRecord } from '../../types';

const PatientMedicalRecords: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [records, setRecords] = useState<PatientMedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewModal, setPreviewModal] = useState<{ show: boolean; record: PatientMedicalRecord | null }>({
    show: false,
    record: null
  });

  useEffect(() => {
    if (patientId) {
      fetchMedicalRecords();
    }
  }, [patientId]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const data = await patientService.getPatientMedicalRecords(patientId!);
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (record: PatientMedicalRecord) => {
    setPreviewModal({ show: true, record });
  };

  const handleDownload = (record: PatientMedicalRecord) => {
    if (record.document_url) {
      window.open(record.document_url, '_blank');
    }
  };

  const columns: Column<PatientMedicalRecord>[] = [
    {
      key: 'id',
      label: 'Record ID',
      sortable: true
    },
    {
      key: 'record_type',
      label: 'Record Type',
      sortable: true,
      render: (record) => (
        <div className="flex items-center">
          <FiFileText className="h-5 w-5 text-blue-600 mr-2" />
          <span className="font-medium">{record.record_type}</span>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (record) => new Date(record.date).toLocaleDateString()
    },
    {
      key: 'provider_name',
      label: 'Provider',
      sortable: true
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (record) => (
        <div className="max-w-md truncate" title={record.description}>
          {record.description}
        </div>
      )
    }
  ];

  const renderActions = (record: PatientMedicalRecord) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handlePreview(record)}
        className="text-blue-600 hover:text-blue-800"
        title="Preview"
      >
        <FiEye className="h-5 w-5" />
      </button>
      {record.document_url && (
        <button
          onClick={() => handleDownload(record)}
          className="text-green-600 hover:text-green-800"
          title="Download"
        >
          <FiDownload className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/admin/patients/${patientId}`)}
            className="text-gray-600 hover:text-gray-900"
          >
            <FiChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={records}
        searchable={false}
        actions={renderActions}
        loading={loading}
        emptyMessage="No medical records found for this patient"
      />

      {/* Preview Modal */}
      <Modal
        isOpen={previewModal.show}
        onClose={() => setPreviewModal({ show: false, record: null })}
        title="Medical Record Details"
      >
        {previewModal.record && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Record Type</p>
              <p className="text-base text-gray-900">{previewModal.record.record_type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="text-base text-gray-900">
                {new Date(previewModal.record.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Provider</p>
              <p className="text-base text-gray-900">{previewModal.record.provider_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="text-base text-gray-900">{previewModal.record.description}</p>
            </div>
            {previewModal.record.document_url && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Document</p>
                <button
                  onClick={() => handleDownload(previewModal.record!)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <FiDownload className="h-4 w-4 mr-2" />
                  Download Document
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientMedicalRecords;
