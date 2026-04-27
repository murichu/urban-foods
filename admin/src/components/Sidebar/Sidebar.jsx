import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Truck,
  Users,
  MessageSquare,
  History,
  Settings,
  User,
} from 'lucide-react';
import './Sidebar.css';

const mainItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/orders', label: 'Orders', Icon: Truck },
];

const mgmtItems = [
  { to: '/add', label: 'Add Item', Icon: PlusCircle },
  { to: '/list', label: 'Menu List', Icon: ClipboardList },
  { to: '/users', label: 'Users', Icon: Users },
  { to: '/reviews', label: 'Reviews', Icon: MessageSquare },
];

const sysItems = [
  { to: '/audit-logs', label: 'Audit Logs', Icon: History },
  { to: '/settings', label: 'Settings', Icon: Settings },
  { to: '/profile', label: 'Profile', Icon: User },
];

const Sidebar = () => (
  <aside className="sidebar" aria-label="Admin navigation">
    <nav className="sidebar-options">
      <div className="sidebar-section-label">Main</div>
      {mainItems.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} className="sidebar-option">
          <Icon className="icon-sm" />
          <p>{label}</p>
        </NavLink>
      ))}

      <div className="sidebar-section-label">Management</div>
      {mgmtItems.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} className="sidebar-option">
          <Icon className="icon-sm" />
          <p>{label}</p>
        </NavLink>
      ))}

      <div className="sidebar-section-label">System</div>
      {sysItems.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} className="sidebar-option">
          <Icon className="icon-sm" />
          <p>{label}</p>
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
