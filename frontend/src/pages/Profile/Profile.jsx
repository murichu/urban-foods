import { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import { 
  User, Mail, ShoppingBag, Heart, LogOut, Settings, 
  Shield, Clock, MapPin, Phone, Edit3, ChevronRight, 
  Package, CreditCard, Bell, Save, X, Lock, CheckCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { Card, Button, Input, Badge } from '../../components/UI/UI';
import './Profile.css';

const Profile = () => {
  const { token, setToken, favorites, cartItems, url } = useContext(StoreContext);
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const response = await axios.get(`${url}/api/user/profile`, {
          headers: { token }
        });
        if (response.data.success) {
          setUserData(response.data.user);
          setEditData({
            name: response.data.user.name,
            phone: response.data.user.phone || '',
            address: response.data.user.address || ''
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, url]);

  const validateForm = () => {
    const newErrors = {};
    if (!editData.name.trim()) newErrors.name = "Name is required";
    if (editData.phone && !/^\+?[0-9]{10,15}$/.test(editData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setToken('');
    navigate('/');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setUpdateLoading(true);
    try {
      const response = await axios.post(`${url}/api/user/update`, editData, {
        headers: { token }
      });
      if (response.data.success) {
        setUserData(response.data.user);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const cartCount = Object.values(cartItems).reduce((a, b) => a + b, 0);

  if (!token) {
    return (
      <div className="profile-login-container">
        <Card glass className="profile-login-card text-center">
          <Shield size={48} className="profile-shield-icon" />
          <h2>Access Denied</h2>
          <p className="text-muted mb-6">Please sign in to view your profile and manage your account.</p>
          <Button variant="primary" onClick={() => navigate('/')}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-loading-screen">
        <div className="loader-tomato"></div>
        <p>Polishing your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page-wrapper">
      <div className="profile-container">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-sidebar-options">
            <div className={`profile-sidebar-item active`}>
              <img src={assets.profile_icon} alt="" />
              <p>Personal Info</p>
            </div>
            <div onClick={() => navigate('/my-orders')} className="profile-sidebar-item">
              <img src={assets.bag_icon} alt="" />
              <p>My Orders</p>
            </div>
            <div onClick={() => navigate('/favorites')} className="profile-sidebar-item">
              <img src={assets.rating_starts} alt="" />
              <p>Favorites</p>
            </div>
            <div onClick={() => navigate('/payments')} className="profile-sidebar-item">
              <img src={assets.parcel_icon} alt="" />
              <p>Payments</p>
            </div>
            <div onClick={() => navigate('/notifications')} className="profile-sidebar-item">
              <img src={assets.bag_icon} alt="" />
              <p>Notifications</p>
            </div>
            <div onClick={() => navigate('/settings')} className="profile-sidebar-item">
              <img src={assets.profile_icon} alt="" />
              <p>Settings</p>
            </div>
            <hr className="sidebar-divider" />
            <div onClick={handleLogout} className="profile-sidebar-item logout-item">
              <img src={assets.logout_icon} alt="" />
              <p>Logout</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="profile-content">
          <div className="content-header">
            <div>
              <h1>{isEditing ? 'Edit Profile' : 'Personal Information'}</h1>
              <p className="text-muted">Manage your identity and account security</p>
            </div>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit3 size={16} /> Edit Details
              </Button>
            )}
          </div>

          {isEditing ? (
            <Card className="edit-profile-card">
              <form onSubmit={handleUpdateProfile}>
                <div className="form-grid">
                  <Input 
                    label="Full Name"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    error={errors.name}
                    icon={User}
                    placeholder="e.g. John Doe"
                  />
                  <Input 
                    label="Phone Number"
                    value={editData.phone}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    error={errors.phone}
                    icon={Phone}
                    placeholder="e.g. +254 700 000 000"
                  />
                  <div className="full-width">
                    <Input 
                      label="Delivery Address"
                      value={editData.address}
                      onChange={(e) => setEditData({...editData, address: e.target.value})}
                      icon={MapPin}
                      placeholder="Street, City, State"
                    />
                  </div>
                </div>
                <div className="form-footer mt-8 flex justify-end gap-4">
                  <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button type="submit" disabled={updateLoading}>
                    {updateLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <div className="info-sections-grid">
              <Card hover className="info-group-card">
                <div className="group-header">
                  <User size={20} className="text-tomato" />
                  <h3>Identity Information</h3>
                </div>
                <div className="info-list">
                  <div className="info-item">
                    <label>Full Name</label>
                    <p>{userData?.name}</p>
                  </div>
                  <div className="info-item">
                    <label>Enterprise ID</label>
                    <p className="id-code">{userData?.enterpriseId}</p>
                  </div>
                </div>
              </Card>

              <Card hover className="info-group-card">
                <div className="group-header">
                  <Mail size={20} className="text-tomato" />
                  <h3>Contact Information</h3>
                </div>
                <div className="info-list">
                  <div className="info-item">
                    <label>Email Address</label>
                    <p>{userData?.email}</p>
                  </div>
                  <div className="info-item">
                    <label>Phone Number</label>
                    <p>{userData?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </Card>

              <Card hover className="info-group-card full-width">
                <div className="group-header">
                  <Lock size={20} className="text-tomato" />
                  <h3>Account Security</h3>
                </div>
                <div className="info-list horizontal">
                  <div className="info-item">
                    <label>Status</label>
                    <div className="status-flex">
                      <CheckCircle size={14} className="text-success" />
                      <span>Verified Account</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Member Since</label>
                    <p>{new Date(userData?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="info-item">
                    <label>Last Updated</label>
                    <p>{new Date(userData?.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
