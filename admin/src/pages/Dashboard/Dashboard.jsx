import { useEffect, useMemo, useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Truck,
  Users,
  Utensils,
  Wallet,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import "./Dashboard.css";

const emptyStats = {
  dailyRevenue: 0,
  monthlyRevenue: 0,
  totalRevenue: 0,
  totalOrders: 0,
  paidOrders: 0,
  pendingOrders: 0,
  pendingPaymentOrders: 0,
  failedPaymentOrders: 0,
  deliveredOrders: 0,
  cancelledOrders: 0,
  totalCustomers: 0,
  totalMenuItems: 0,
  statusBreakdown: {},
  paymentBreakdown: {},
  weeklyTrend: [],
  topItems: [],
  recentOrders: [],
  recentActivity: [],
  systemHealth: { dbStatus: "Loading", apiStatus: "Loading", serverLoad: 0 },
};

const money = (value) => `KSh ${Number(value || 0).toLocaleString()}`;
const number = (value) => Number(value || 0).toLocaleString();

const percent = (value, total) => {
  if (!total) return 0;
  return Math.round((Number(value || 0) / total) * 100);
};

const Dashboard = () => {
  const { adminToken } = useAdminAuth();
  const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async ({ silent = false } = {}) => {
    try {
      const res = await axios.get(`${url}/api/order/stats`, {
        headers: { token: adminToken },
      });
      if (res.data.success) {
        setStats({ ...emptyStats, ...res.data.stats });
        setLastUpdated(new Date());
      }
    } catch (error) {
      if (!silent) toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminToken) return;

    fetchStats();
    const interval = setInterval(() => fetchStats({ silent: true }), 15000);
    return () => clearInterval(interval);
  }, [adminToken, url]);

  const statusItems = useMemo(() => {
    const breakdown = stats.statusBreakdown || {};
    return [
      { label: "Order Placed", value: breakdown["Order Placed"] || 0, color: "#f59e0b" },
      { label: "Food Processing", value: breakdown["Food Processing"] || 0, color: "#3b82f6" },
      { label: "Out for Delivery", value: breakdown["Out for Delivery"] || 0, color: "#8b5cf6" },
      { label: "Delivered", value: breakdown.Delivered || 0, color: "#10b981" },
      { label: "Cancelled", value: breakdown.Cancelled || 0, color: "#ef4444" },
    ];
  }, [stats.statusBreakdown]);

  const maxTrend = Math.max(...(stats.weeklyTrend || []).map((day) => day.orders), 1);
  const paidRate = percent(stats.paidOrders, stats.totalOrders);
  const deliveredRate = percent(stats.deliveredOrders, stats.totalOrders);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-ring" />
        <p>Loading live dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Live Operations</span>
          <h1>Admin Dashboard</h1>
          <p>Real-time order, payment, menu, and customer metrics from Urban Foods.</p>
        </div>
        <div className="header-actions">
          <div className="live-chip">
            <span className="live-dot" />
            Updated {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "now"}
          </div>
          <button className="refresh-btn" onClick={() => fetchStats()} type="button">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </header>

      <section className="metric-grid">
        <MetricCard icon={Wallet} label="Today Revenue" value={money(stats.dailyRevenue)} tone="revenue" />
        <MetricCard icon={TrendingUp} label="Month Revenue" value={money(stats.monthlyRevenue)} tone="growth" />
        <MetricCard icon={Package} label="Total Orders" value={number(stats.totalOrders)} tone="orders" />
        <MetricCard icon={CreditCard} label="Paid Orders" value={`${paidRate}%`} helper={`${number(stats.paidOrders)} paid`} tone="paid" />
        <MetricCard icon={Users} label="Customers" value={number(stats.totalCustomers)} tone="customers" />
        <MetricCard icon={Utensils} label="Menu Items" value={number(stats.totalMenuItems)} tone="menu" />
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-card wide">
          <div className="card-title-row">
            <div>
              <h2>7-Day Order Trend</h2>
              <p>Orders and paid revenue by day.</p>
            </div>
            <div className="summary-pill">{money(stats.totalRevenue)} total paid revenue</div>
          </div>
          <div className="trend-chart">
            {(stats.weeklyTrend || []).map((day) => (
              <div className="trend-day" key={day.date}>
                <div className="bar-wrap">
                  <div
                    className="trend-bar"
                    style={{ height: `${Math.max((day.orders / maxTrend) * 100, day.orders ? 12 : 4)}%` }}
                    title={`${day.orders} orders, ${money(day.revenue)}`}
                  />
                </div>
                <strong>{day.orders}</strong>
                <span>{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-title-row compact">
            <div>
              <h2>Fulfillment</h2>
              <p>{deliveredRate}% delivered</p>
            </div>
            <Truck size={20} />
          </div>
          <div className="status-list">
            {statusItems.map((item) => (
              <div className="status-row" key={item.label}>
                <div className="status-row-top">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
                <div className="status-track">
                  <span
                    style={{
                      width: `${Math.max(percent(item.value, stats.totalOrders), item.value ? 5 : 0)}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-title-row compact">
            <div>
              <h2>Payment Health</h2>
              <p>Current M-Pesa/order payment state.</p>
            </div>
            <CreditCard size={20} />
          </div>
          <div className="payment-health">
            <div className="payment-circle" style={{ "--paid": `${paidRate}%` }}>
              <span>{paidRate}%</span>
              <small>paid</small>
            </div>
            <div className="payment-breakdown">
              <HealthLine label="Paid" value={stats.paidOrders} icon={CheckCircle} />
              <HealthLine label="Pending" value={stats.pendingPaymentOrders} icon={Clock} />
              <HealthLine label="Failed" value={stats.failedPaymentOrders} icon={AlertCircle} />
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-title-row compact">
            <div>
              <h2>Top Items</h2>
              <p>Best sellers by quantity.</p>
            </div>
            <ShoppingBag size={20} />
          </div>
          <div className="top-items">
            {(stats.topItems || []).length ? (
              stats.topItems.map((item, index) => (
                <div className="top-item" key={item._id || index}>
                  <span className="rank">{index + 1}</span>
                  <div>
                    <strong>{item._id || "Unnamed item"}</strong>
                    <small>{number(item.quantity)} sold</small>
                  </div>
                  <span>{money(item.revenue)}</span>
                </div>
              ))
            ) : (
              <p className="empty-state">No item sales yet.</p>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-title-row compact">
            <div>
              <h2>Recent Orders</h2>
              <p>Latest customer activity.</p>
            </div>
            <Activity size={20} />
          </div>
          <div className="recent-orders">
            {(stats.recentOrders || []).length ? (
              stats.recentOrders.map((order) => (
                <div className="recent-order" key={order._id}>
                  <div>
                    <strong>#{order.orderId || String(order._id).slice(-6)}</strong>
                    <span>{order.address?.firstName || "Customer"} · {order.status}</span>
                  </div>
                  <div className={order.payment ? "pay-state paid" : "pay-state pending"}>
                    {order.payment ? "Paid" : order.paymentStatus || "Pending"}
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-state">No recent orders.</p>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-title-row compact">
            <div>
              <h2>System & Audit</h2>
              <p>Connectivity and recent audit events.</p>
            </div>
            <Activity size={20} />
          </div>
          <div className="system-lines">
            <HealthLine label="Database" value={stats.systemHealth.dbStatus} icon={CheckCircle} />
            <HealthLine label="API" value={stats.systemHealth.apiStatus} icon={CheckCircle} />
            <HealthLine label="Load" value={stats.systemHealth.serverLoad} icon={Activity} />
          </div>
          <div className="audit-list">
            {(stats.recentActivity || []).slice(0, 4).map((log) => (
              <div className="audit-item" key={log._id}>
                <span className={log.status === "success" ? "audit-dot success" : "audit-dot danger"} />
                <div>
                  <strong>{String(log.action || "").replace(/_/g, " ")}</strong>
                  <small>{new Date(log.createdAt).toLocaleString()}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, helper, tone }) => (
  <div className={`metric-card ${tone}`}>
    <div className="metric-icon">
      <Icon size={20} />
    </div>
    <span>{label}</span>
    <strong>{value}</strong>
    {helper && <small>{helper}</small>}
  </div>
);

const HealthLine = ({ icon: Icon, label, value }) => (
  <div className="health-line">
    <Icon size={15} />
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

export default Dashboard;
