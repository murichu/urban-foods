import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Users as UsersIcon, Search, Mail, Phone, Calendar, 
  Trash2, Shield, UserCheck, UserX, ArrowUpDown 
} from 'lucide-react';
import './Users.css';

const Users = ({ url }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const adminToken = localStorage.getItem('adminToken');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/user/list`, {
        headers: { token: adminToken }
      });
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [url]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await axios.post(`${url}/api/user/remove`, { id }, {
        headers: { token: adminToken }
      });
      if (response.data.success) {
        toast.success('User deleted');
        setUsers(users.filter(u => u._id !== id));
      }
    } catch (error) {
      toast.error('Error deleting user');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.enterpriseId?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="users-page">
      <header className="premium-page-header">
        <div className="header-info-flex">
          <div className="header-icon-container">
            <UsersIcon size={28} />
          </div>
          <div className="header-titles">
            <h1>User Management</h1>
            <p>View and manage registered customers</p>
          </div>
        </div>
        <div className="header-action-items">
          <div className="stats-badge">
            <UserCheck size={16} />
            <span>{users.length} Total Users</span>
          </div>
        </div>
      </header>

      <div className="users-container">
        <div className="toolbar-premium">
          <div className="search-box-premium">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search by name, email or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="users-table-wrapper">
          <table className="premium-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Basic Info</th>
                <th>Contact</th>
                <th>Joined Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-10">Loading users...</td></tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td><span className="id-badge">#{user.enterpriseId || user._id.slice(-6)}</span></td>
                    <td>
                      <div className="user-info-cell">
                        <div className="user-avatar-mini">{user.name[0]}</div>
                        <div>
                          <strong>{user.name}</strong>
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info-cell">
                        <div className="info-line"><Mail size={14} /> {user.email}</div>
                        {user.phone && <div className="info-line"><Phone size={14} /> {user.phone}</div>}
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <Calendar size={14} />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="text-right">
                      <button className="delete-action-btn" onClick={() => handleDelete(user._id)}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-10">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
