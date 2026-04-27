import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import {
  CreditCard, Search, ArrowUpRight, ArrowDownLeft,
  Filter, Download, Wallet, Clock, CheckCircle, XCircle,
  TrendingUp, Calendar, Smartphone, Shield, Eye,
  ChevronRight, CircleDollarSign, Receipt, Banknote,
  AlertCircle, Sparkles, Zap, Activity
} from 'lucide-react';
import { Card, Input, Badge } from '../../components/UI/UI';
import axios from 'axios';
import './Payments.css';

const Payments = () => {
  const { url, token } = useContext(StoreContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.post(url + "/api/order/user-orders", {}, {
          headers: { token }
        });
        if (response.data.success) {
          setTransactions(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchTransactions();
  }, [token, url]);

  const filteredTransactions = transactions.filter(tx => {
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'success' && !tx.payment) return false;
      if (selectedFilter === 'pending' && (tx.payment || tx.status === 'Cancelled')) return false;
      if (selectedFilter === 'failed' && tx.status !== 'Cancelled') return false;
    }
    if (searchTerm) {
      const idMatch = (tx.paymentId || tx._id).toLowerCase().includes(searchTerm.toLowerCase());
      const amountMatch = tx.amount.toString().includes(searchTerm);
      return idMatch || amountMatch;
    }
    return true;
  });

  const totalSpent = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const successCount = transactions.filter(tx => tx.payment).length;
  const successRate = transactions.length > 0 ? ((successCount / transactions.length) * 100).toFixed(1) : 0;

  const getStatusConfig = (transaction) => {
    if (transaction.payment) {
      return {
        label: 'Completed',
        icon: <CheckCircle size={14} />,
        class: 'success',
        bg: 'rgba(16, 185, 129, 0.1)'
      };
    }
    if (transaction.status === 'Cancelled') {
      return {
        label: 'Failed',
        icon: <XCircle size={14} />,
        class: 'danger',
        bg: 'rgba(239, 68, 68, 0.1)'
      };
    }
    return {
      label: 'Pending',
      icon: <Clock size={14} />,
      class: 'warning',
      bg: 'rgba(245, 158, 11, 0.1)'
    };
  };

  if (loading) {
    return (
      <div className="payments-loading">
        <div className="loading-container">
          <div className="loading-animation">
            <div className="loading-ring"></div>
            <div className="loading-ring-inner"></div>
          </div>
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payments-page">
      <div className="payments-bg">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>

      <div className="payments-container">
        {/* Header */}
        <div className="payments-header">
          <div className="header-left">
            <div className="header-badge">
              <Receipt size={16} />
              <span>Payment History</span>
            </div>
            <h1>Transactions Overview</h1>
            <p>Track and manage all your payment activities</p>
          </div>
          <div className="header-right">
            <button className="quick-action-btn">
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card premium">
            <div className="stat-icon total">
              <Wallet size={22} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Spent</span>
              <span className="stat-value">Ksh {totalSpent.toLocaleString()}</span>
              <span className="stat-trend positive">
                <TrendingUp size={12} />
                +12.5% from last month
              </span>
            </div>
          </div>

          <div className="stat-card premium">
            <div className="stat-icon success">
              <CheckCircle size={22} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Success Rate</span>
              <span className="stat-value">{successRate}%</span>
              <span className="stat-trend positive">
                <Activity size={12} />
                {successCount}/{transactions.length} successful
              </span>
            </div>
          </div>

          <div className="stat-card premium">
            <div className="stat-icon primary">
              <Smartphone size={22} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Payment Method</span>
              <span className="stat-value">M-Pesa</span>
              <span className="stat-trend">Primary method</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="search-filter-bar">
          <div className="search-wrapper">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by transaction ID or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="clear-search">
                ✕
              </button>
            )}
          </div>
          <div className="filter-chips">
            <button
              className={`filter-chip ${selectedFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-chip ${selectedFilter === 'success' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('success')}
            >
              <CheckCircle size={14} />
              Successful
            </button>
            <button
              className={`filter-chip ${selectedFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('pending')}
            >
              <Clock size={14} />
              Pending
            </button>
            <button
              className={`filter-chip ${selectedFilter === 'failed' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('failed')}
            >
              <XCircle size={14} />
              Failed
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="results-info">
          <span>{filteredTransactions.length} transactions found</span>
          {(searchTerm || selectedFilter !== 'all') && (
            <button
              className="clear-filters"
              onClick={() => {
                setSearchTerm('');
                setSelectedFilter('all');
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Transactions List */}
        <div className="transactions-list">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx, index) => {
              const status = getStatusConfig(tx);
              return (
                <div key={tx._id} className="transaction-item" style={{ animationDelay: `${index * 0.03}s` }}>
                  <div className="transaction-icon" style={{ background: status.bg, color: status.class === 'success' ? '#10b981' : status.class === 'danger' ? '#ef4444' : '#f59e0b' }}>
                    {status.icon}
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-header">
                      <span className="transaction-id">
                        {tx.paymentId || tx._id.substring(0, 16)}...
                      </span>
                      <span className="transaction-date">
                        <Calendar size={12} />
                        {new Date(tx.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="transaction-meta">
                      <span className="transaction-method">
                        <Smartphone size={12} />
                        M-Pesa
                      </span>
                      <span className="transaction-type">
                        <ArrowDownLeft size={12} />
                        Payment
                      </span>
                    </div>
                  </div>
                  <div className="transaction-amount">
                    <span className="amount">Ksh {tx.amount.toLocaleString()}</span>
                    <span className={`status-badge ${status.class}`}>
                      {status.icon}
                      {status.label}
                    </span>
                  </div>
                  <button
                    className="view-details"
                    onClick={() => setSelectedTransaction(tx)}
                  >
                    <Eye size={16} />
                    <ChevronRight size={14} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="empty-transactions">
              <div className="empty-icon">
                <Receipt size={64} />
              </div>
              <h3>No transactions found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button
                className="reset-btn"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('all');
                }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Transaction Details Modal */}
        {selectedTransaction && (
          <div className="transaction-modal" onClick={() => setSelectedTransaction(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-icon">
                  <Receipt size={24} />
                </div>
                <h3>Transaction Details</h3>
                <button className="modal-close" onClick={() => setSelectedTransaction(null)}>
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <span>Transaction ID</span>
                  <span className="mono">{selectedTransaction.paymentId || selectedTransaction._id}</span>
                </div>
                <div className="detail-row">
                  <span>Amount</span>
                  <strong>Ksh {selectedTransaction.amount.toLocaleString()}</strong>
                </div>
                <div className="detail-row">
                  <span>Payment Method</span>
                  <span>M-Pesa Express</span>
                </div>
                <div className="detail-row">
                  <span>Date & Time</span>
                  <span>{new Date(selectedTransaction.date).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>Status</span>
                  <span className={`status-badge ${getStatusConfig(selectedTransaction).class}`}>
                    {getStatusConfig(selectedTransaction).icon}
                    {getStatusConfig(selectedTransaction).label}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Order Reference</span>
                  <span className="mono">{selectedTransaction._id.substring(0, 24)}</span>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setSelectedTransaction(null)}>
                  Close
                </button>
                <button className="btn-primary">
                  <Download size={16} />
                  Download Receipt
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="action-card">
            <Banknote size={24} />
            <div>
              <h4>Add Payment Method</h4>
              <p>Link another M-Pesa account or card</p>
            </div>
            <ChevronRight size={18} />
          </div>
          <div className="action-card">
            <Shield size={24} />
            <div>
              <h4>Security Settings</h4>
              <p>Manage your payment security preferences</p>
            </div>
            <ChevronRight size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;