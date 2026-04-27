import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { User, Settings, LogOut, ChevronDown, Shield, Bell } from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const { logout, adminToken } = useAdminAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const dropdownRef = useRef(null);
  const url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  const fetchPendingCount = async () => {
    if (!adminToken) return;
    try {
      const res = await axios.get(`${url}/api/order/stats`, {
        headers: { token: adminToken }
      });
      if (res.data.success) {
        setPendingCount(res.data.stats.pendingOrders || 0);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 60000); // Check every min
    return () => clearInterval(interval);
  }, [adminToken]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="navbar">
      <div className="navbar-left">
        <img className="logo" src={assets.logo} alt="Urban Foods" onClick={() => navigate('/')} />

      </div>

      <div className="navbar-right">
        <div className="notifications-btn" onClick={() => navigate('/orders')}>
          <Bell size={20} />
          {pendingCount > 0 && <span className="notification-badge">{pendingCount}</span>}
        </div>

        <div className="profile-dropdown-container" ref={dropdownRef}>
          <button
            className="profile-trigger"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="avatar-wrapper">
              <img src={assets.profile_image} alt="Admin" />
              <div className="status-dot online"></div>
            </div>
            <div className="admin-meta">
              <span className="admin-name">Super Admin</span>
              <ChevronDown size={14} className={`chevron ${isDropdownOpen ? 'open' : ''}`} />
            </div>
          </button>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <Shield size={16} />
                <span>Admin Controls</span>
              </div>
              <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                <User size={16} /> Profile
              </Link>
              <Link to="/settings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                <Settings size={16} /> Settings
              </Link>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Badge = ({ children, variant }) => (
  <span className={`admin-badge ${variant}`}>{children}</span>
);

export default Navbar;
