import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import ExcelJS from "exceljs";
import toast from "react-hot-toast";
import {
  Search,
  Eye,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Truck,
  CheckCircle,
  Clock,
  X,
  CreditCard,
  Zap,
  AlertCircle,
  Filter
} from "lucide-react";
export const Card = ({ children, className = '', padding = true, glass = false, hover = false }) => (
  <div className={`admin-ui-card ${padding ? 'p-6' : ''} ${glass ? 'glass' : ''} ${hover ? 'hover-effect' : ''} ${className}`}>
    {children}
  </div>
);

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick, 
  disabled = false,
  type = 'button',
  icon: Icon
}) => (
  <button 
    type={type}
    className={`admin-ui-btn btn-${variant} btn-${size} ${className}`} 
    onClick={onClick}
    disabled={disabled}
  >
    {Icon && <Icon size={size === 'sm' ? 16 : 18} className="btn-icon" />}
    {children}
  </button>
);
export const Badge = ({ children, variant = 'default' }) => (
  <span className={`status-badge-premium ${variant}`}>
    <span className="dot"></span>
    {children}
  </span>
);

import "./Orders.css";

const ORDER_STATUSES = [
  "Order Placed",
  "Food Processing",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
];

const Orders = ({ url }) => {
  const token = localStorage.getItem("adminToken");

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");

  const [stats, setStats] = useState({
    total: 0,
    placed: 0,
    processing: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${url}/api/order/list`, {
        params: { 
          page, 
          search, 
          status: statusFilter === "All" ? "" : statusFilter,
          paymentStatus: paymentFilter === "All" ? "" : paymentFilter
        },
        headers: { token }
      });

      if (data.success) {
        const list = data.data || [];
        setOrders(list);
        setTotalPages(data.totalPages || 1);

        setStats({
          total: list.length,
          placed: list.filter(o => o.status === "Order Placed").length,
          processing: list.filter(o => o.status === "Food Processing").length,
          shipping: list.filter(o => o.status === "Out for Delivery").length,
          delivered: list.filter(o => o.status === "Delivered").length,
          cancelled: list.filter(o => o.status === "Cancelled").length
        });
      }
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, paymentFilter, token, url]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 400); // 400ms is ideal for responsiveness
    return () => clearTimeout(timer);
  }, [search, page, statusFilter, paymentFilter, fetchOrders]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handleStatusChange = async (id, status) => {
    const order = orders.find(o => o._id === id);
    
    // Validation: Cannot mark as Delivered if not paid
    if (status === "Delivered" && !order.payment) {
      toast.error("Cannot mark as Delivered: Payment not received");
      return;
    }

    try {
      await axios.patch(
        `${url}/api/order/status`,
        { orderId: id, status },
        { headers: { token } }
      );

      setOrders(prev =>
        prev.map(o => (o._id === id ? { ...o, status } : o))
      );
      
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder(prev => ({...prev, status}));
      }

      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error("Update failed");
    }
  };

  const exportExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Orders");

    ws.columns = [
      { header: "ID", key: "id", width: 15 },
      { header: "Customer", key: "customer", width: 20 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Status", key: "status", width: 20 }
    ];

    orders.forEach(o =>
      ws.addRow({
        id: o._id.slice(-6),
        customer: `${o.address?.firstName}`,
        amount: o.amount,
        status: o.status
      })
    );

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf]);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "orders.xlsx";
    link.click();
  };

  const handlePayNow = async () => {
    if (!selectedOrder) return;
    setLoading(true);
    try {
      const res = await axios.post(`${url}/api/mpesa/admin/stkpush`, {
        orderId: selectedOrder.orderId || selectedOrder._id,
        phoneNumber: selectedOrder.address.phone,
        amount: selectedOrder.amount
      }, {
        headers: { token }
      });

      if (res.data.success) {
        toast.success("Payment request sent to customer");
      } else {
        toast.error(res.data.message || "Failed to initiate payment");
      }
    } catch (err) {
      toast.error("Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (id) => {
    const order = orders.find(o => o._id === id);
    setSelectedOrder(order);
  };

  return (
    <div className="orders-page fluid">
      {/* HEADER */}
      <header className="premium-page-header">
        <div className="header-info-flex">
          <div className="header-icon-container">
            <Truck size={28} />
          </div>
          <div className="header-titles">
            <h1>Orders</h1>
            <p>Manage and track customer orders</p>
          </div>
        </div>
        <div className="header-action-items">
          <Button size="sm" variant="outline" onClick={exportExcel}>
            <FileSpreadsheet size={16} /> Export
          </Button>
          <Button size="sm" onClick={fetchOrders}>
            Refresh
          </Button>
        </div>
      </header>

      {/* STATS */}
      <div className="stats-grid-premium">
        <Card glass hover className="stat-card-advanced">
          <div className="stat-content">
            <div className="stat-icon-box total">
              <ShoppingBag size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-trend positive">+8%</div>
        </Card>

        <Card glass hover className="stat-card-advanced">
          <div className="stat-content">
            <div className="stat-icon-box placed">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.placed}</h3>
              <p>New Orders</p>
            </div>
          </div>
        </Card>

        <Card glass hover className="stat-card-advanced">
          <div className="stat-content">
            <div className="stat-icon-box pending">
              <Zap size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.processing}</h3>
              <p>Processing</p>
            </div>
          </div>
        </Card>

        <Card glass hover className="stat-card-advanced">
          <div className="stat-content">
            <div className="stat-icon-box shipping">
              <Truck size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.shipping}</h3>
              <p>Out for Delivery</p>
            </div>
          </div>
        </Card>

        <Card glass hover className="stat-card-advanced">
          <div className="stat-content">
            <div className="stat-icon-box success">
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.delivered}</h3>
              <p>Delivered</p>
            </div>
          </div>
        </Card>

        <Card glass hover className="stat-card-advanced">
          <div className="stat-content">
            <div className="stat-icon-box cancelled">
              <AlertCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.cancelled}</h3>
              <p>Cancelled</p>
            </div>
          </div>
        </Card>
      </div>

      {/* TABLE */}
      <Card className="orders-card" padding={false}>
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search">
              <Search size={16} />
              <input
                placeholder="Search orders..."
                value={search}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="toolbar-right">
            <div className="filter-group">
              <div className="filter-item">
                <Filter size={14} />
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                  <option value="All">All Status</option>
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="filter-item">
                <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}>
                  <option value="All">All Payment</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="loading">
                    Loading...
                  </td>
                </tr>
              ) : orders.length ? (
                orders.map(o => (
                  <tr key={o._id}>
                    <td className="id">#{o._id.slice(-6)}</td>

                    <td>
                      <div className="customer-cell">
                        <strong>{o.address?.firstName}</strong>
                        <span>{o.address?.phone || "—"}</span>
                      </div>
                    </td>

                    <td>
                       <div className={`payment-status-pill ${o.payment ? 'paid' : 'unpaid'}`}>
                         {o.payment ? 'Paid' : 'Pending'}
                       </div>
                    </td>

                    <td>
                      <div className="items-count-tag">
                        {o.items?.length} items
                      </div>
                    </td>

                    <td className="amount-cell">
                      <span className="currency">KSh</span>
                      <strong>{o.amount.toLocaleString()}</strong>
                    </td>

                    <td>
                      <div className="status-select-container">
                        <select
                          value={o.status}
                          onChange={e =>
                            handleStatusChange(o._id, e.target.value)
                          }
                          className={`status-dropdown ${o.status.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {ORDER_STATUSES.map(s => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>

                    <td className="actions-cell">
                      <button
                        className="view-btn"
                        onClick={() => openDetail(o._id)}
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="list-footer-info">
          <p className="footer-stats">Showing page <strong>{page}</strong> of <strong>{totalPages}</strong></p>
          
          {totalPages > 1 && (
            <div className="modern-pagination">
              <button 
                className="page-btn nav-btn" 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              
              <div className="page-numbers">
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i + 1} 
                    className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <button 
                className="page-btn nav-btn" 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* DETAIL MODAL */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-glass-header">
              <div className="header-top">
                <div className="header-badge">#{selectedOrder._id.slice(-6)}</div>
                <div className={`payment-badge ${selectedOrder.payment ? 'paid' : 'unpaid'}`}>
                  {selectedOrder.payment ? 'PAYMENT RECEIVED' : 'PAYMENT PENDING'}
                </div>
                <button className="close-btn-round" onClick={() => setSelectedOrder(null)}>
                   <X size={20} />
                </button>
              </div>
              <div className="header-main">
                <h2>Order Details</h2>
                <div className="order-meta-info">
                   <span>Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</span>
                   <span className="dot-sep"></span>
                   <span>{selectedOrder.items?.length} items total</span>
                </div>
              </div>
            </div>

            <div className="modal-body-premium">
              {/* STATUS TRACKER */}
              <div className="status-tracker-container">
                 <div className="section-label">Order Journey</div>
                 <div className="status-tracker">
                    {(selectedOrder.status === 'Cancelled' ? ['Order Placed', 'Cancelled'] : ORDER_STATUSES).map((s, i, arr) => {
                    const displayStatuses = selectedOrder.status === 'Cancelled' ? ['Order Placed', 'Cancelled'] : ORDER_STATUSES;
                    const currentIndex = displayStatuses.indexOf(selectedOrder.status);
                    const isCompleted = i < currentIndex;
                    const isActive = i === currentIndex;
                    
                    return (
                        <div key={s} className={`step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                        <div className="step-marker">
                            {isCompleted ? <CheckCircle size={14} /> : <span>{i + 1}</span>}
                        </div>
                        <span className="step-label">{s}</span>
                        {i < arr.length - 1 && <div className="step-line"></div>}
                        </div>
                    );
                    })}
                </div>
              </div>

              <div className="customer-card-premium">
                 <div className="customer-card-header">
                    <div className="customer-avatar">
                       {selectedOrder.address?.firstName?.charAt(0)}
                    </div>
                    <div className="customer-main-info">
                       <h4>{selectedOrder.address?.firstName} {selectedOrder.address?.lastName}</h4>
                       <span>{selectedOrder.address?.email || "No email provided"}</span>
                    </div>
                    <a href={`tel:${selectedOrder.address?.phone}`} className="call-customer-btn">
                       <Truck size={16} />
                    </a>
                 </div>
                 
                 <div className="delivery-address-box">
                    <label>Delivery Address</label>
                    <p>{selectedOrder.address?.street}, {selectedOrder.address?.city}</p>
                    <p className="sub-address">{selectedOrder.address?.state}, {selectedOrder.address?.zipcode}</p>
                 </div>
              </div>

              <div className="order-items-section">
                <div className="section-label">Order Manifest</div>
                <div className="items-list-compact">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="item-mini-card">
                      <div className="item-thumb">
                        <img src={`${url}/images/${item.image}`} alt="" />
                      </div>
                      <div className="item-details">
                        <div className="item-row">
                          <span className="item-name">{item.name}</span>
                          <span className="item-qty">x{item.quantity}</span>
                        </div>
                        <span className="item-price-unit">KSh {item.price.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="financial-summary-card">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>KSh {selectedOrder.amount.toLocaleString()}</strong>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span className="free-label">FREE</span>
                </div>
                <div className="summary-row grand-total">
                  <span>Total Amount</span>
                  <h3>KSh {selectedOrder.amount.toLocaleString()}</h3>
                </div>
              </div>
            </div>

            <div className="modal-footer">
               <div className="status-selector-wrapper">
                 <label>Update Order Status</label>
                 <select 
                   value={selectedOrder.status} 
                   onChange={(e) => {
                     handleStatusChange(selectedOrder._id, e.target.value);
                     setSelectedOrder({...selectedOrder, status: e.target.value});
                   }}
                   className={`status-select ${selectedOrder.status.toLowerCase().replace(/\s+/g, '-')}`}
                 >
                   {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
               </div>

               <div className="footer-actions">
                 {selectedOrder.status === 'Out for Delivery' && (selectedOrder.paymentStatus === 'Pending' || !selectedOrder.payment) && (
                    <Button variant="outline" className="pay-now-btn" onClick={handlePayNow} disabled={loading}>
                      <CreditCard size={16} /> Pay Now
                    </Button>
                 )}
                 <Button onClick={() => setSelectedOrder(null)}>Close Details</Button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Stat = ({ title, value, icon }) => (
  <div className="stat">
    <div className="icon">{icon}</div>
    <div>
      <span>{title}</span>
      <h3>{value}</h3>
    </div>
  </div>
);

Orders.propTypes = {
  url: PropTypes.string.isRequired
};

export default Orders;