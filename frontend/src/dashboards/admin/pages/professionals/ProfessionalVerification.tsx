import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiUser, FiMail } from 'react-icons/fi';
import { Button, Modal } from '../../components';
import { professionalService } from '../../services/professionalService';

const ProfessionalVerification: React.FC = () => {
  const navigate = useNavigate();
  const [pendingProfessionals, setPendingProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [verifyModal, setVerifyModal] = useState<{ show: boolean; professional: any }>({ show: false, professional: null });
  const [rejectModal, setRejectModal] = useState<{ show: boolean; professional: any; reason: string }>({ show: false, professional: null, reason: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await professionalService.getPendingVerifications();
      setPendingProfessionals(data);
    } catch (error) {
      console.error('Failed to fetch pending verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyModal.professional) return;
    setActionLoading(true);
    try {
      await professionalService.verifyProfessional(verifyModal.professional.id);
      setVerifyModal({ show: false, professional: null });
      setSelected(null);
      fetchPending();
    } catch { alert('Failed to verify. Please try again.'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectModal.professional || !rejectModal.reason.trim()) { alert('Please provide a rejection reason.'); return; }
    setActionLoading(true);
    try {
      await professionalService.rejectProfessional(rejectModal.professional.id, rejectModal.reason);
      setRejectModal({ show: false, professional: null, reason: '' });
      setSelected(null);
      fetchPending();
    } catch { alert('Failed to reject. Please try again.'); }
    finally { setActionLoading(false); }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Professional Verification</h1>
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
          {pendingProfessionals.length} pending
        </span>
      </div>

      {pendingProfessionals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FiCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-600">No pending professional verifications.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Pending Professionals</h2>
            {pendingProfessionals.map((p: any) => {
              const name = `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim() || 'Unknown';
              const email = p.user?.email || '';
              return (
                <div key={p.id}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${selected?.id === p.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
                  onClick={() => setSelected(p)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FiUser className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{p.professionalType} {p.specialization ? `- ${p.specialization}` : ''}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1 gap-1">
                          <FiMail className="h-3 w-3" /> {email}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>License: {p.licenseNumber || 'N/A'}</span>
                    <span>{p.user?.createdAt ? new Date(p.user.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail Panel */}
          <div className="space-y-4">
            {selected ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Details</h2>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => setVerifyModal({ show: true, professional: selected })}>
                      <FiCheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setRejectModal({ show: true, professional: selected, reason: '' })}>
                      <FiXCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{`${selected.user?.firstName || ''} ${selected.user?.lastName || ''}`.trim()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-sm">{selected.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium capitalize">{selected.professionalType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Specialization</p>
                      <p className="font-medium">{selected.specialization || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">License Number</p>
                      <p className="font-medium">{selected.licenseNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium">{selected.yearsOfExperience || 0} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selected.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Consultation Fee</p>
                      <p className="font-medium">{selected.consultationFee ? `₦${selected.consultationFee}` : 'N/A'}</p>
                    </div>
                  </div>
                  {selected.bio && (
                    <div>
                      <p className="text-sm text-gray-500">Bio</p>
                      <p className="text-sm text-gray-700 mt-1">{selected.bio}</p>
                    </div>
                  )}
                </div>

                <Button variant="secondary" onClick={() => navigate(`/admin/professionals/${selected.id}`)} className="w-full">
                  View Full Profile
                </Button>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <FiUser className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Click a professional to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Verify Modal */}
      <Modal isOpen={verifyModal.show} onClose={() => setVerifyModal({ show: false, professional: null })} title="Approve Professional">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <FiCheckCircle className="h-6 w-6 text-green-600" />
            <p className="text-green-800">This will grant the professional full platform access.</p>
          </div>
          <p className="text-gray-700">Approve <strong>{verifyModal.professional?.user?.firstName} {verifyModal.professional?.user?.lastName}</strong>?</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setVerifyModal({ show: false, professional: null })}>Cancel</Button>
            <Button variant="primary" onClick={handleVerify} disabled={actionLoading}>
              {actionLoading ? 'Approving...' : 'Approve'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={rejectModal.show} onClose={() => setRejectModal({ show: false, professional: null, reason: '' })} title="Reject Professional">
        <div className="space-y-4">
          <p className="text-gray-700">Reason for rejecting <strong>{rejectModal.professional?.user?.firstName} {rejectModal.professional?.user?.lastName}</strong>:</p>
          <textarea value={rejectModal.reason} onChange={e => setRejectModal({ ...rejectModal, reason: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            rows={4} placeholder="Enter rejection reason..." />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRejectModal({ show: false, professional: null, reason: '' })}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} disabled={actionLoading}>
              {actionLoading ? 'Rejecting...' : 'Reject'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfessionalVerification;
