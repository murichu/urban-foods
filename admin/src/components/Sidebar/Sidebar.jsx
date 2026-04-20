import { NavLink } from 'react-router-dom';
import {
  ClipboardDocumentListIcon,
  PlusCircleIcon,
  TruckIcon,
} from '../icons/HeroIcons';
import './Sidebar.css';

const navItems = [
  { to: '/add', label: 'Add Items', Icon: PlusCircleIcon },
  { to: '/list', label: 'List Items', Icon: ClipboardDocumentListIcon },
  { to: '/orders', label: 'Orders', Icon: TruckIcon },
];

const Sidebar = () => (
  <aside className="sidebar" aria-label="Admin navigation">
    <nav className="sidebar-options">
      {navItems.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} className="sidebar-option">
          <Icon className="icon-sm" />
          <p>{label}</p>
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
