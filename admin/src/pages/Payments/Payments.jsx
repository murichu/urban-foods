import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  CreditCard,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "./Payments.css";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const formatMoney = (value) => `Ksh ${Number(value || 0).toLocaleString()}`;

const statusConfig = {
  completed: {
    label: "Completed",
    className: "status-completed",
    icon: BadgeCheck,
  },
  failed: { label: "Failed", className: "status-failed", icon: XCircle },
  pending: { label: "Pending", className: "status-pending", icon: Clock3 },
};

const methodLabel = {
  mpesa_stk: "M-Pesa STK",
  mpesa_c2b: "M-Pesa C2B",
};

const Payments = () => {
  const { adminToken: token } = useAdminAuth();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchPayments = async ({ nextPage = page, silent = false } = {}) => {
    if (!token) return;

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data } = await axios.get(`${API_URL}/api/payments/list`, {
        headers: { token },
        params: {
          page: nextPage,
          limit: 20,
          search,
          status: statusFilter,
          method: methodFilter,
        },
      });

      if (data.success) {
        setPayments(data.data || []);
        setSummary(data.summary || null);
        setTotalPages(data.totalPages || 1);
        setSelectedPayment((current) => {
          if (!current) return data.data?.[0] || null;
          const nextSelected = (data.data || []).find(
            (item) => String(item._id) === String(current._id)
          );
          return nextSelected || data.data?.[0] || null;
        });
      } else {
        toast.error(data.message || "Failed to load payments");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments({ nextPage: 1 });
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, methodFilter, token]);

  useEffect(() => {
    if (token && !loading) {
      fetchPayments({ nextPage: page, silent: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const stats = useMemo(() => {
    return [
      {
        label: "Total Payments",
        value: summary
          ? summary.completedCount + summary.failedCount + summary.pendingCount
          : payments.length,
        icon: CreditCard,
      },
      {
        label: "Completed",
        value: summary?.completedCount || 0,
        icon: BadgeCheck,
      },
      {
        label: "Failed",
        value: summary?.failedCount || 0,
        icon: AlertCircle,
      },
      {
        label: "Pending",
        value: summary?.pendingCount || 0,
        icon: Clock3,
      },
      {
        label: "Volume",
        value: formatMoney(summary?.totalAmount || 0),
        icon: CircleDollarSign,
      },
    ];
  }, [payments.length, summary]);

  const selected = selectedPayment || payments[0];

  return (
    <div className="payments-page">
      <header className="payments-header">
        <div>
          <p className="eyebrow">Payments</p>
          <h1>Transaction Ledger</h1>
          <p className="page-subtitle">
            Review payment activity, transaction IDs, and the orders they belong
            to.
          </p>
        </div>
        <button
          className="refresh-btn"
          onClick={() => fetchPayments({ nextPage: page, silent: true })}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? "spin" : ""} />
          Refresh
        </button>
      </header>

      <section className="payments-stats">
        {stats.map(({ label, value, icon: Icon }) => (
          <article key={label} className="stat-card">
            <div className="stat-icon">
              <Icon size={18} />
            </div>
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="payments-toolbar">
        <label className="search-field">
          <Search size={16} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transaction ID, order ID, phone, or receipt"
          />
        </label>

        <div className="filters">
          <div className="filter-field">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="filter-field">
            <CreditCard size={16} />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option value="All">All Methods</option>
              <option value="mpesa_stk">M-Pesa STK</option>
              <option value="mpesa_c2b">M-Pesa C2B</option>
            </select>
          </div>
        </div>
      </section>

      <section className="payments-layout">
        <div className="payments-table-card">
          <div className="table-header-row">
            <h2>Payments</h2>
            <span>{payments.length} rows on this page</span>
          </div>

          {loading ? (
            <div className="table-state">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="table-state">
              <AlertCircle size={20} />
              No payment records found.
            </div>
          ) : (
            <div className="payments-table-wrap">
              <table className="payments-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Method</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const config =
                      statusConfig[payment.status] || statusConfig.pending;
                    const StatusIcon = config.icon;
                    return (
                      <tr
                        key={payment._id}
                        className={
                          selected?._id === payment._id ? "selected" : ""
                        }
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <td>
                          <strong>{payment.transactionId || "N/A"}</strong>
                          <span className="subtle">{payment.paymentId}</span>
                        </td>
                        <td>
                          <strong>{payment.order?.orderId || "N/A"}</strong>
                          <span className="subtle">
                            {payment.order?.trackingId || "No tracking"}
                          </span>
                        </td>
                        <td>
                          <strong>
                            {payment.user?.name || "Unknown user"}
                          </strong>
                          <span className="subtle">
                            {payment.user?.email || payment.phoneNumber || "-"}
                          </span>
                        </td>
                        <td>{formatMoney(payment.amount)}</td>
                        <td>
                          <span className={`status-pill ${config.className}`}>
                            <StatusIcon size={14} />
                            {config.label}
                          </span>
                        </td>
                        <td>
                          {methodLabel[payment.method] || payment.method || "-"}
                        </td>
                        <td>
                          {payment.createdAt
                            ? new Date(payment.createdAt).toLocaleString()
                            : "-"}
                        </td>
                        <td className="row-arrow">View</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="pagination-bar">
            <button
              className="page-btn"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              className="page-btn"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <aside className="payment-detail-card">
          <div className="detail-header">
            <div>
              <p className="eyebrow">Selected Payment</p>
              <h2>{selected?.transactionId || "No transaction selected"}</h2>
            </div>
            <CreditCard size={20} />
          </div>

          {!selected ? (
            <div className="detail-empty">
              Select a payment to inspect its details.
            </div>
          ) : (
            <div className="detail-content">
              <div className="detail-block">
                <span className="detail-label">Transaction ID</span>
                <strong>{selected.transactionId || "N/A"}</strong>
              </div>
              <div className="detail-block">
                <span className="detail-label">Order ID</span>
                <strong>{selected.order?.orderId || "N/A"}</strong>
              </div>
              <div className="detail-block">
                <span className="detail-label">Customer</span>
                <strong>{selected.user?.name || "Unknown"}</strong>
                <span>{selected.user?.email || "-"}</span>
              </div>
              <div className="detail-block">
                <span className="detail-label">Amount</span>
                <strong>{formatMoney(selected.amount)}</strong>
              </div>
              <div className="detail-block">
                <span className="detail-label">Status</span>
                <strong>
                  {statusConfig[selected.status]?.label || selected.status}
                </strong>
              </div>
              <div className="detail-block">
                <span className="detail-label">Method</span>
                <strong>
                  {methodLabel[selected.method] || selected.method}
                </strong>
              </div>
              <div className="detail-block">
                <span className="detail-label">Checkout Request</span>
                <span className="mono">
                  {selected.CheckoutRequestID || "-"}
                </span>
              </div>
              <div className="detail-block">
                <span className="detail-label">Merchant Request</span>
                <span className="mono">
                  {selected.MerchantRequestID || "-"}
                </span>
              </div>
              <div className="detail-block">
                <span className="detail-label">Result</span>
                <span>{selected.ResultDesc || "-"}</span>
              </div>
              <div className="detail-block">
                <span className="detail-label">Created</span>
                <span>
                  {selected.createdAt
                    ? new Date(selected.createdAt).toLocaleString()
                    : "-"}
                </span>
              </div>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
};

export default Payments;
