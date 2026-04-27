import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Search, Filter, Calendar, User, Eye,
  ArrowUpDown, History, Download, RefreshCcw,
  Shield, Terminal, Info, X, ChevronDown,
  AlertCircle, CheckCircle, Clock, Server,
  Zap, Activity, MapPin, Globe, Smartphone,
  Lock, Database, Bell
} from 'lucide-react';
import './AuditLogs.css';

const AuditLogs = ({ url }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${url}/api/audit/list`, {
        headers: { token }
      });
      if (response.data.success) {
        setLogs(response.data.data);
        toast.success('Logs updated successfully');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const exportToCSV = () => {
    const filtered = getFilteredLogs();
    const csvData = filtered.map(log => ({
      Timestamp: new Date(log.createdAt).toLocaleString(),
      Operator: log.userEmail || 'SYSTEM',
      Action: log.action,
      Resource: log.entity,
      Status: log.status,
      IP: log.ipAddress || 'N/A'
    }));

    const csv = [Object.keys(csvData[0]).join(','),
    ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Export started');
  };

  const getFilteredLogs = () => {
    let filtered = logs.filter(log => {
      const matchesSearch =
        log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.metadata?.toString().toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction = filterAction === 'all' || log.action === filterAction;

      const matchesDateRange = (!dateRange.start || new Date(log.createdAt) >= new Date(dateRange.start)) &&
        (!dateRange.end || new Date(log.createdAt) <= new Date(dateRange.end));

      return matchesSearch && matchesAction && matchesDateRange;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'createdAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const getPaginatedLogs = () => {
    const filtered = getFilteredLogs();
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filtered.slice(start, end);
  };

  const filteredLogs = getPaginatedLogs();
  const totalFiltered = getFilteredLogs().length;
  const totalPages = Math.ceil(totalFiltered / itemsPerPage);

  const getActionVariant = (action) => {
    const a = action.toLowerCase();
    if (a.includes('delete')) return 'danger';
    if (a.includes('create')) return 'success';
    if (a.includes('update')) return 'warning';
    if (a.includes('login')) return 'info';
    return 'default';
  };

  const getActionIcon = (action) => {
    const a = action.toLowerCase();
    if (a.includes('delete')) return '🗑️';
    if (a.includes('create')) return '✨';
    if (a.includes('update')) return '✏️';
    if (a.includes('login')) return '🔐';
    return '📝';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterAction('all');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
    toast('Filters cleared', { icon: 'ℹ️' });
  };

  return (
    <div className="audit-page">
      <div className="audit-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <header className="premium-page-header">
        <div className="header-info-flex">
          <div className="header-icon-container">
            <Shield size={28} />
          </div>
          <div className="header-titles">
            <h1>Audit Trail</h1>
            <p>Comprehensive security monitoring & compliance tracking</p>
          </div>
        </div>
        <div className="header-action-items">
          <div className="stats-badge">
            <Activity size={16} />
            <span>{totalFiltered} Events</span>
          </div>
          <button className="action-btn secondary" onClick={exportToCSV}>
            <Download size={18} />
            <span className="hide-mobile">Export</span>
          </button>
          <button className="action-btn primary" onClick={fetchLogs}>
            <RefreshCcw size={18} />
            <span className="hide-mobile">Refresh</span>
          </button>
        </div>
      </header>



      <div className="audit-table-container">
        <div className="table-toolbar">
          <div className="per-page-selector">
            <span>Show</span>
            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>
          <div className="table-info">
            Showing {filteredLogs.length} of {totalFiltered} events
          </div>
        </div>

        <div className="table-responsive-wrapper">
          <table className="audit-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('createdAt')} className="sortable">
                  Timestamp <ArrowUpDown size={14} />
                </th>
                <th onClick={() => handleSort('userEmail')} className="sortable">
                  Operator <ArrowUpDown size={14} />
                </th>
                <th onClick={() => handleSort('action')} className="sortable">
                  Operation <ArrowUpDown size={14} />
                </th>
                <th>Resource</th>
                <th onClick={() => handleSort('status')} className="sortable">
                  Status <ArrowUpDown size={14} />
                </th>
                <th>IP Address</th>
                <th>Actions</th>
              </tr>
              <tr className="table-filter-row">
                <th>
                  <div className="table-date-filter">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      title="Start Date"
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      title="End Date"
                    />
                  </div>
                </th>
                <th>
                  <div className="table-input-with-icon">
                    <Search size={14} />
                    <input
                      type="text"
                      placeholder="Search operator, resource..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </th>
                <th>
                  <div className="table-input-with-icon">
                    <Filter size={14} />
                    <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
                      <option value="all">All Operations</option>
                      <option value="LOGIN">LOGIN</option>
                      <option value="CREATE">CREATE</option>
                      <option value="UPDATE">UPDATE</option>
                      <option value="DELETE">DELETE</option>
                      <option value="MPESA_CALLBACK">PAYMENT</option>
                    </select>
                  </div>
                </th>
                <th></th>
                <th></th>
                <th></th>
                <th>
                  <button className="table-clear-filters" onClick={clearFilters}>
                    Clear Filters
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <p>Loading security logs...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                  <tr key={log._id} className="log-row" style={{ animationDelay: `${index * 0.05}s` }}>
                    <td className="timestamp-cell">
                      <div className="timestamp-wrapper">
                        <Clock size={14} />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td>
                      <div className="operator-cell">
                        <div className="operator-avatar">
                          {log.userEmail ? log.userEmail[0].toUpperCase() : 'S'}
                        </div>
                        <div className="operator-info">
                          <span className="operator-name">{log.userEmail || 'SYSTEM'}</span>
                          <span className="operator-role">Administrator</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`action-badge ${getActionVariant(log.action)}`}>
                        <span className="action-icon">{getActionIcon(log.action)}</span>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span className="resource-label">
                        <Database size={12} />
                        {log.entity}
                      </span>
                    </td>
                    <td>
                      <div className={`status-badge ${log.status === 'SUCCESS' ? 'success' : 'failed'}`}>
                        {log.status === 'SUCCESS' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                        {log.status}
                      </div>
                    </td>
                    <td>
                      <div className="ip-cell">
                        <MapPin size={12} />
                        {log.ipAddress || 'Internal'}
                      </div>
                    </td>
                    <td>
                      <button className="view-details-btn" onClick={() => setSelectedLog(log)}>
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <Bell size={48} />
                      <h3>No logs found</h3>
                      <p>Try adjusting your filters or refresh the page</p>
                      <button className="action-btn primary" onClick={clearFilters}>
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="list-footer-info">
          <p className="footer-stats">Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></p>
          
          {totalPages > 1 && (
            <div className="modern-pagination">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="page-btn nav-btn"
              >
                Previous
              </button>
              <div className="page-numbers">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="page-btn nav-btn"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedLog && (
        <div className="audit-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="audit-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                <Lock size={24} />
              </div>
              <div>
                <h2>Event Details</h2>
                <p className="modal-subtitle">Comprehensive audit information</p>
              </div>
              <button className="modal-close" onClick={() => setSelectedLog(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="event-summary">
                <div className="event-type">
                  <span className={`event-badge ${getActionVariant(selectedLog.action)}`}>
                    {getActionIcon(selectedLog.action)} {selectedLog.action}
                  </span>
                  <span className={`status-badge ${selectedLog.status === 'SUCCESS' ? 'success' : 'failed'}`}>
                    {selectedLog.status === 'SUCCESS' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    {selectedLog.status}
                  </span>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <label>Occurred At</label>
                  <div className="detail-value">
                    <Calendar size={16} />
                    {new Date(selectedLog.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="detail-item">
                  <label>Operator</label>
                  <div className="detail-value">
                    <User size={16} />
                    {selectedLog.userEmail || 'System Core'}
                  </div>
                </div>
                <div className="detail-item">
                  <label>Resource</label>
                  <div className="detail-value">
                    <Database size={16} />
                    {selectedLog.entity}
                  </div>
                </div>
                <div className="detail-item">
                  <label>Network Source</label>
                  <div className="detail-value">
                    <Globe size={16} />
                    {selectedLog.ipAddress || 'Internal Network'}
                  </div>
                </div>
                <div className="detail-item full-width">
                  <label>User Agent</label>
                  <div className="detail-value">
                    <Smartphone size={16} />
                    {selectedLog.userAgent || 'Not captured'}
                  </div>
                </div>
              </div>

              <div className="payload-section">
                <label>Operational Data</label>
                <div className="json-viewer">
                  <pre>{JSON.stringify(selectedLog.metadata, null, 2) || "No data available"}</pre>
                </div>
              </div>

              {selectedLog.error && (
                <div className="error-section">
                  <label>Error Details</label>
                  <div className="error-content">
                    <AlertCircle size={16} />
                    {selectedLog.error}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="action-btn secondary" onClick={() => setSelectedLog(null)}>
                Close
              </button>
              <button className="action-btn primary" onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
                toast.success('Copied to clipboard');
              }}>
                Copy Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
