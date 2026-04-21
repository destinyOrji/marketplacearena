import React, { useState, useEffect } from 'react';
import { FiDownload } from 'react-icons/fi';
import { Button } from '../../components';
import DataTable, { Column } from '../../components/DataTable';
import { settingsService } from '../../services/settingsService';
import { AuditLog } from '../../types';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, pageSize: 20, totalItems: 0 });

  useEffect(() => {
    fetchLogs();
  }, [pagination.currentPage, actionFilter, startDate, endDate]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getAuditLogs({
        page: pagination.currentPage,
        page_size: pagination.pageSize,
        action: actionFilter,
        start_date: startDate,
        end_date: endDate
      });
      setLogs(response.data);
      setPagination({
        currentPage: response.pagination.page,
        totalPages: response.pagination.total_pages,
        pageSize: response.pagination.page_size,
        totalItems: response.pagination.total
      });
    } catch (error) {
      console.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await settingsService.exportAuditLogs({ action: actionFilter, start_date: startDate, end_date: endDate });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString()}.csv`;
      a.click();
    } catch (error) {
      alert('Failed to export audit logs');
    }
  };

  const columns: Column<AuditLog>[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'admin_name', label: 'Admin', sortable: true },
    { key: 'action', label: 'Action', sortable: true },
    { key: 'resource', label: 'Resource', sortable: true },
    { key: 'ip_address', label: 'IP Address', sortable: false },
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (log) => new Date(log.timestamp).toLocaleString()
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="verify">Verify</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>
        <Button onClick={handleExport}>
          <FiDownload className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          pageSize: pagination.pageSize,
          totalItems: pagination.totalItems,
          onPageChange: (page) => setPagination({ ...pagination, currentPage: page })
        }}
        emptyMessage="No audit logs found"
      />
    </div>
  );
};

export default AuditLogs;
