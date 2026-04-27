import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  Search, ArrowRight, Mic, Calendar, 
  ChevronDown, Shield, CreditCard, Activity, 
  Settings, Lock, Zap, CheckCircle, AlertCircle, X
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const { adminToken } = useAdminAuth();
  const url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  const [stats, setStats] = useState({
    dailyRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    systemHealth: { dbStatus: 'Loading...', apiStatus: 'Loading...', serverLoad: '0' },
    recentActivity: []
  });

  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${url}/api/order/stats`, {
        headers: { token: adminToken }
      });
      if (res.data.success) setStats(res.data.stats);
    } catch {
      toast.error("Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchStats();
      const interval = setInterval(fetchStats, 60000); 
      return () => clearInterval(interval);
    }
  }, [adminToken, url]);

  if (loading) {
    return (
      <div className="dashboard-skeleton-container">
        <div className="skeleton-hero">
           <div className="skeleton skeleton-circle" style={{ width: 60, height: 60 }}></div>
           <div className="skeleton skeleton-title" style={{ width: 200 }}></div>
        </div>
        <div className="skeleton-grid">
           <div className="skeleton-card skeleton" style={{ height: 200 }}></div>
           <div className="skeleton-card skeleton" style={{ height: 200 }}></div>
           <div className="skeleton-card skeleton" style={{ height: 200 }}></div>
           <div className="skeleton-card skeleton" style={{ height: 300, gridColumn: 'span 2' }}></div>
           <div className="skeleton-card skeleton" style={{ height: 300 }}></div>
        </div>
      </div>
    );
  }

  const today = new Date();
  const dateNum = today.getDate();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'short' });
  const monthName = today.toLocaleDateString('en-US', { month: 'long' });

  // Calculate percentages for the concentric circles
  const total = stats.totalOrders || 1;
  const pPending = Math.round((stats.pendingOrders / total) * 100);
  const pDelivered = Math.round((stats.deliveredOrders / total) * 100);

  return (
    <div className="dash-premium-wrapper">
      {/* TOP NAVBAR */}
      <div className="dash-navbar">
        <div className="nav-left">
          <div className="nav-logo-box">UF</div>
          <div className="nav-title">
            <strong>Urban Foods</strong>
            <span>Dashboard</span>
          </div>
        </div>

        <div className="nav-center">
          <div className="nav-profile">
            <div className="avatar">A</div>
            <div className="profile-text">
              <strong>Admin User</strong>
              <span>System Manager</span>
            </div>
          </div>
        </div>

        <div className="nav-right">
          <div className="nav-search">
            <Search size={18} />
            <input type="text" placeholder="Start searching here..." />
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="dash-hero">
        <div className="hero-left">
          <div className="date-pill">
            <h2>{dateNum}</h2>
            <div className="date-text">
              <strong>{dayName},</strong>
              <span>{monthName}</span>
            </div>
          </div>
          <button className="btn-tasks">
            Show my Tasks <ArrowRight size={16} />
          </button>
          <div className="icon-btn-circular"><Calendar size={18} /></div>
        </div>

        <div className="hero-right">
          <div className="greeting">
            <h2>Hey, Need help? 👋</h2>
            <p>Just ask me anything!</p>
          </div>
          <button className="btn-mic"><Mic size={20} /></button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="dash-grid">
        
        {/* COLUMN 1 */}
        <div className="grid-col col-1">
          {/* Revenue Card (VISA Style) */}
          <div className="premium-card revenue-card">
            <div className="rev-header">
              <strong>URBAN FOODS</strong>
              <div className="rev-dropdown">Live Data <ChevronDown size={14} /></div>
            </div>
            <div className="rev-body">
              <span>Today's Revenue</span>
              <h3>KSh {stats.dailyRevenue.toLocaleString()}</h3>
            </div>
            <div className="rev-actions">
              <button className="btn-dark">Receive</button>
              <button className="btn-light">Send</button>
            </div>
            <div className="rev-footer">
              <div className="fee">
                <span>Monthly target</span>
                <strong>KSh 50,000</strong>
              </div>
              <div className="edit-limit">
                <Settings size={14} /> Edit limitations
              </div>
            </div>
          </div>

          {/* Annual Profits -> Order Distribution */}
          <div className="premium-card chart-card">
            <div className="chart-header">
              <strong>Order Distribution</strong>
              <div className="rev-dropdown">Today <ChevronDown size={14} /></div>
            </div>
            
            <div className="concentric-chart">
              <div className="circle circle-1">
                <div className="circle circle-2">
                  <div className="circle circle-3">
                    <span className="chart-val">{stats.totalOrders}</span>
                  </div>
                  <span className="chart-val-top">{stats.deliveredOrders} D</span>
                </div>
                <span className="chart-val-top">{stats.pendingOrders} P</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2 */}
        <div className="grid-col col-2">
          {/* Top small stats */}
          <div className="small-stats-group">
            <div className="premium-card small-stat">
              <div className="stat-icon-top"><Activity size={16}/></div>
              <div className="rev-dropdown">Weekly <ChevronDown size={14} /></div>
              <div className="stat-info">
                <span>Total Orders</span>
                <h3>{stats.totalOrders}</h3>
              </div>
            </div>
            
            <div className="premium-card small-stat">
              <div className="stat-icon-top"><CheckCircle size={16}/></div>
              <div className="rev-dropdown">Weekly <ChevronDown size={14} /></div>
              <div className="stat-info">
                <span>Delivered</span>
                <h3 className="text-danger">{stats.deliveredOrders}</h3>
              </div>
              <div className="view-chart-link"><Zap size={12}/> View on chart mode</div>
            </div>
          </div>

          {/* Activity Manager */}
          <div className="premium-card activity-manager">
            <div className="am-header">
              <strong>Activity manager</strong>
              <div className="am-filters">
                <span className="filter-pill">Team <span className="dot red"></span></span>
                <span className="filter-pill">Insights <span className="dot gray"></span></span>
                <span className="filter-pill">Today <X size={12}/></span>
              </div>
            </div>
            
            <div className="am-search">
              <Search size={14} />
              <input type="text" placeholder="Search in activities..." />
            </div>

            <div className="am-content">
              <div className="am-main-stat">
                <h3>{stats.pendingOrders} <span>PENDING</span></h3>
                
                {/* CSS Bar Chart */}
                <div className="css-bar-chart">
                  {/* Map real order counts over the last week if available, otherwise use stats */}
                  {[30, 50, stats.totalOrders > 0 ? 100 : 20, 60, 40, stats.deliveredOrders > 0 ? 80 : 30, 90].map((h, i) => (
                    <div key={i} title={`${h} orders`} className={`bar ${i === 6 ? 'active' : ''}`} style={{ height: `${Math.min(h, 100)}%` }}></div>
                  ))}
                </div>
                <div className="chart-dots">
                  <span className="dot gray"></span><span className="dot red"></span><span className="dot gray"></span>
                </div>
              </div>

              <div className="am-plans">
                <div className="plan-header">
                  <strong>System Health</strong>
                  <ChevronDown size={14}/>
                </div>
                <ul className="plan-list">
                  <li><span className="dot red"></span> DB: {stats.systemHealth.dbStatus}</li>
                  <li><span className="dot red"></span> API: {stats.systemHealth.apiStatus}</li>
                  <li><span className="dot red"></span> Load: {stats.systemHealth.serverLoad}%</li>
                </ul>
              </div>

              <div className="am-recent-list">
                <strong>Recent Events</strong>
                <div className="activity-stack">
                  {stats.recentActivity && stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((log) => (
                      <div key={log._id} className="activity-item-mini">
                        <div className={`status-dot ${log.status === 'success' ? 'bg-success' : 'bg-danger'}`}></div>
                        <div className="activity-text">
                          <span className="action">{log.action.replace(/_/g, ' ')}</span>
                          <span className="time">{new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3 */}
        <div className="grid-col col-3">
          
          <div className="side-stats-group">
            <div className="premium-card lock-card">
              <Lock size={20} />
              <span>System Lock</span>
            </div>
            
            <div className="premium-card uptime-card">
              <Activity size={16} />
              <div className="uptime-info">
                <strong>99.9%</strong>
                <span>Uptime SLA</span>
              </div>
              <div className="dot-grid">
                {[...Array(24)].map((_, i) => <div key={i} className={`mini-dot ${i > 20 ? 'gray' : 'red'}`}></div>)}
              </div>
            </div>

            <div className="premium-card growth-card">
              <div className="circular-progress">
                <span>{pDelivered}%</span>
                <small>Delivered</small>
              </div>
            </div>
          </div>

          <div className="premium-card stocks-card">
            <div className="stocks-header">
              <Activity size={16} />
              <h3>{stats.totalOrders * 12}</h3>
            </div>
            <div className="sparkline">
               <svg viewBox="0 0 100 20" className="sparkline-svg">
                 <path d="M0,10 Q5,5 10,15 T20,10 T30,18 T40,5 T50,15 T60,8 T70,12 T80,2 T90,16 T100,5" fill="none" stroke="#FF6B6B" strokeWidth="1.5" />
               </svg>
            </div>
            <div className="stocks-footer">
              <div>
                <strong>Platform Usage</strong>
                <span>Extended & Limited</span>
              </div>
              <span className="growth-badge">+ 9.3%</span>
            </div>
          </div>

          <div className="premium-card review-card">
            <div className="review-dots"><span/><span/><span/></div>
            <button className="close-btn"><X size={14}/></button>
            <span>Review rating</span>
            <h3>How is your business management going?</h3>
            <div className="rating-faces">
              <div className="face"><div className="mouth sad"></div></div>
              <div className="face"><div className="mouth neutral"></div></div>
              <div className="face"><div className="mouth happy"></div></div>
              <div className="face active"><div className="mouth very-happy"></div></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
