/**
 * Admin — All Ambulance Providers — responsive card/table layout
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiTrash2, FiCheckCircle, FiXCircle, FiSearch, FiTruck } from 'react-icons/fi';
import { Modal, Button } from '../../components';
import { ambulanceService } from '../../services/ambulanceService';

const AllProviders: React.FC = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [deleteModal, setDeleteModal] = useState<{ show: boolean; p: any | null }>({ show: false, p: null });
  const [verifyModal, setVerifyModal] = useState<{ show: boolean; p: any | null }>({ show: false, p: null });
  const [rejectModal, setRejectModal] = useState<{ show: boolean; p: any | null; reason: string }>({ show: false, p: null, reason: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchProviders(); }, [page, typeFilter, statusFilter]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await ambulanceService.getProviders({ page, page_size: 20, search, service_type: typeFilter, verification_status: statusFilter });
      setProviders(res.data || []);
      setTotalPages(res.pagination?.total_pages ?? 1);
      setTotalItems(res.pagination?.total ?? res.data?.length ?? 0);
    } catch { setProviders([]); }
    finally { setLoading(false); }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchProviders(); };

  const doVerify = async () => {
    if (!verifyModal.p) return;
    setActionLoading(true);
    try { await ambulanceService.verifyProvider(verifyModal.p.id); setVerifyModal({ show: false, p: null }); fetchProviders(); }
    catch { alert('Failed to verify'); } finally { setActionLoading(false); }
  };

  const doReject = async () => {
    if (!rejectModal.p || !rejectModal.reason.trim()) { alert('Please provide a reason.'); return; }
    setActionLoading(true);
    try { await ambulanceService.rejectProvider(rejectModal.p.id, rejectModal.reason); setRejectModal({ show: false, p: null, reason: '' }); fetchProviders(); }
    catch { alert('Failed to reject'); } finally { setActionLoading(false); }
  };

  const doDelete = async () => {
    if (!deleteModal.p) return;
    setActionLoading(true);
    try { await ambulanceService.deleteProvider(deleteModal.p.id); setDeleteModal({ show: false, p: null }); fetchProviders(); }
    catch { alert('Failed to delete'); } finally { setActionLoading(false); }
  };

  const statusBadge = (s: string) => s === 'verified' ? 'bg-green-100 text-green-800' : s === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';
  const onlineBadge = (online: boolean) => online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Ambulance Providers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalItems} provider{totalItems !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, registration or location..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
          </div>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Types</option>
            <option value="Basic Life Support (BLS)">Basic Life Support</option>
            <option value="Advanced Life Support (ALS)">Advanced Life Support</option>
            <option value="Air Ambulance">Air Ambulance</option>
            <option value="Patient Transport">Patient Transport</option>
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <button type="submit" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">Search</button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
      ) : providers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
          <FiTruck className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No ambulance providers found</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['Provider', 'Service Type', 'Registration', 'Location', 'Phone', 'Availability', 'Verification', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {providers.map((p: any) => {
                    const name = p.provider_name || p.serviceName || 'N/A';
                    const vs   = p.verification_status || 'pending';
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center flex-shrink-0">
                              <FiTruck className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{name}</p>
                              <p className="text-xs text-gray-400">{p.email || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{p.service_type || p.serviceType || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{p.registration_number || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{p.city && p.state ? `${p.city}, ${p.state}` : p.city || p.state || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{p.phone || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${onlineBadge(p.is_online)}`}>{p.is_online ? 'Online' : 'Offline'}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusBadge(vs)}`}>{vs}</span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => navigate(`/admin/ambulances/${p.id}`)} title="View" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"><FiEye className="h-4 w-4" /></button>
                            {vs === 'pending' && <>
                              <button onClick={() => setVerifyModal({ show: true, p })} title="Verify" className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md"><FiCheckCircle className="h-4 w-4" /></button>
                              <button onClick={() => setRejectModal({ show: true, p, reason: '' })} title="Reject" className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"><FiXCircle className="h-4 w-4" /></button>
                            </>}
                            <button onClick={() => setDeleteModal({ show: true, p })} title="Delete" className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"><FiTrash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {providers.map((p: any) => {
              const name = p.provider_name || p.serviceName || 'N/A';
              const vs   = p.verification_status || 'pending';
              return (
                <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center flex-shrink-0">
                        <FiTruck className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{name}</p>
                        <p className="text-xs text-gray-400">{p.email || ''}</p>
                      </div>
                    </div>
                    <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${statusBadge(vs)}`}>{vs}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-600">
                    <div><span className="text-gray-400">Type: </span>{p.service_type || p.serviceType || '—'}</div>
                    <div><span className="text-gray-400">Reg: </span>{p.registration_number || '—'}</div>
                    <div><span className="text-gray-400">Location: </span>{p.city && p.state ? `${p.city}, ${p.state}` : '—'}</div>
                    <div><span className="text-gray-400">Phone: </span>{p.phone || '—'}</div>
                    <div><span className="text-gray-400">Status: </span><span className={`font-semibold ${p.is_online ? 'text-green-600' : 'text-gray-500'}`}>{p.is_online ? 'Online' : 'Offline'}</span></div>
                  </div>
                  <div className="flex gap-2 pt-1 border-t border-gray-100">
                    <button onClick={() => navigate(`/admin/ambulances/${p.id}`)} className="flex-1 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">View</button>
                    {vs === 'pending' && <>
                      <button onClick={() => setVerifyModal({ show: true, p })} className="flex-1 py-1.5 text-xs font-semibold text-green-700 border border-green-200 rounded-lg hover:bg-green-50">Verify</button>
                      <button onClick={() => setRejectModal({ show: true, p, reason: '' })} className="flex-1 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50">Reject</button>
                    </>}
                    <button onClick={() => setDeleteModal({ show: true, p })} className="py-1.5 px-3 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"><FiTrash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
              <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <Modal isOpen={verifyModal.show} onClose={() => setVerifyModal({ show: false, p: null })} title="Verify Provider">
        <div className="space-y-4">
          <p className="text-gray-700">Verify <strong>{verifyModal.p?.provider_name || verifyModal.p?.serviceName}</strong>?</p>
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setVerifyModal({ show: false, p: null })}>Cancel</Button><Button variant="primary" onClick={doVerify} disabled={actionLoading}>{actionLoading ? 'Verifying...' : 'Verify'}</Button></div>
        </div>
      </Modal>
      <Modal isOpen={rejectModal.show} onClose={() => setRejectModal({ show: false, p: null, reason: '' })} title="Reject Provider">
        <div className="space-y-4">
          <p className="text-gray-700">Reason for rejecting <strong>{rejectModal.p?.provider_name || rejectModal.p?.serviceName}</strong>:</p>
          <textarea value={rejectModal.reason} onChange={e => setRejectModal({ ...rejectModal, reason: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" rows={4} placeholder="Enter rejection reason..." />
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setRejectModal({ show: false, p: null, reason: '' })}>Cancel</Button><Button variant="danger" onClick={doReject} disabled={actionLoading}>{actionLoading ? 'Rejecting...' : 'Reject'}</Button></div>
        </div>
      </Modal>
      <Modal isOpen={deleteModal.show} onClose={() => setDeleteModal({ show: false, p: null })} title="Delete Provider">
        <div className="space-y-4">
          <p className="text-gray-700">Delete <strong>{deleteModal.p?.provider_name || deleteModal.p?.serviceName}</strong>? This cannot be undone.</p>
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setDeleteModal({ show: false, p: null })}>Cancel</Button><Button variant="danger" onClick={doDelete} disabled={actionLoading}>{actionLoading ? 'Deleting...' : 'Delete'}</Button></div>
        </div>
      </Modal>
    </div>
  );
};

export default AllProviders;
