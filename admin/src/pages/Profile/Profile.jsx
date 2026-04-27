import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { User, Mail, ShieldCheck, Clock, Building2, Phone, MapPin, Hash, Save, RefreshCw } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { logout, adminToken } = useAdminAuth();
  const url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@urbanfoods.com';

  const [settings, setSettings] = useState({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    businessPin: '',
    invoicePrefix: '',
    currency: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${url}/api/settings/get`);
        if (res.data.success) {
          setSettings(res.data.data);
        }
      } catch (err) {
        toast.error("Failed to load business settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [url]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post(`${url}/api/settings/update`, settings, {
        headers: { token: adminToken }
      });
      if (res.data.success) {
        toast.success("Business details updated");
      }
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <div className="profile-loading">Loading Profile...</div>;

  return (
    <div className="profile-page">
      <header className="premium-page-header">
        <div className="header-info-flex">
          <div className="header-icon-container">
            <User size={28} />
          </div>
          <div className="header-titles">
            <h1>Settings & Profile</h1>
            <p>Manage your account identity and business details</p>
          </div>
        </div>
      </header>

      <div className="profile-grid">
        {/* LEFT COLUMN: ADMIN IDENTITY */}
        <div className="profile-col-left">
          <div className="profile-card identity-card">
            <div className="avatar-large-wrapper">
              <div className="avatar-main">
                 <User size={48} />
              </div>
              <div className="status-badge-online">Online</div>
            </div>
            <h2>Super Admin</h2>
            <p className="admin-role">System Administrator</p>
            
            <div className="identity-stats">
               <div className="stat-pill">
                  <Mail size={14} />
                  <span>{adminEmail}</span>
               </div>
               <div className="stat-pill">
                  <ShieldCheck size={14} />
                  <span>Full Access</span>
               </div>
            </div>

            <div className="login-history-mini">
               <label>Current Session</label>
               <div className="history-item">
                  <Clock size={14} />
                  <span>{new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
               </div>
            </div>

            <button className="logout-btn-premium" onClick={logout}>
              Log Out Securely
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: BUSINESS PROFILE */}
        <div className="profile-col-right">
          <form className="profile-card business-card" onSubmit={handleUpdate}>
            <div className="card-header-flex">
               <div className="card-title-icon">
                  <Building2 size={20} />
                  <h3>Business Details</h3>
               </div>
               <button type="submit" className="save-changes-btn" disabled={saving}>
                  {saving ? <RefreshCw className="spinner" size={16} /> : <Save size={16} />}
                  <span>{saving ? 'Saving...' : 'Save Profile'}</span>
               </button>
            </div>

            <div className="business-form-grid">
               <div className="form-group-premium">
                  <label>Business Name</label>
                  <div className="input-wrapper">
                     <Building2 size={16} />
                     <input 
                       type="text" 
                       value={settings.businessName} 
                       onChange={e => setSettings({...settings, businessName: e.target.value})} 
                       placeholder="e.g. Urban Foods Ltd"
                     />
                  </div>
               </div>

               <div className="form-group-premium">
                  <label>Business Email (Invoicing)</label>
                  <div className="input-wrapper">
                     <Mail size={16} />
                     <input 
                       type="email" 
                       value={settings.businessEmail} 
                       onChange={e => setSettings({...settings, businessEmail: e.target.value})} 
                       placeholder="billing@urbanfoods.com"
                     />
                  </div>
               </div>

               <div className="form-group-premium">
                  <label>Contact Phone</label>
                  <div className="input-wrapper">
                     <Phone size={16} />
                     <input 
                       type="text" 
                       value={settings.businessPhone} 
                       onChange={e => setSettings({...settings, businessPhone: e.target.value})} 
                       placeholder="+254 700 000 000"
                     />
                  </div>
               </div>

               <div className="form-group-premium">
                  <label>Business PIN / Tax ID</label>
                  <div className="input-wrapper">
                     <Hash size={16} />
                     <input 
                       type="text" 
                       value={settings.businessPin} 
                       onChange={e => setSettings({...settings, businessPin: e.target.value})} 
                       placeholder="P000000000X"
                     />
                  </div>
               </div>

               <div className="form-group-premium full-width">
                  <label>Physical Address</label>
                  <div className="input-wrapper">
                     <MapPin size={16} />
                     <textarea 
                       value={settings.businessAddress} 
                       onChange={e => setSettings({...settings, businessAddress: e.target.value})} 
                       placeholder="123 Street, Nairobi, Kenya"
                       rows="2"
                     ></textarea>
                  </div>
               </div>

               <div className="form-group-premium">
                  <label>Invoice Prefix</label>
                  <div className="input-wrapper">
                     <Hash size={16} />
                     <input 
                       type="text" 
                       value={settings.invoicePrefix} 
                       onChange={e => setSettings({...settings, invoicePrefix: e.target.value})} 
                       placeholder="URB-"
                     />
                  </div>
               </div>

               <div className="form-group-premium">
                  <label>Default Currency</label>
                  <div className="input-wrapper">
                     <Hash size={16} />
                     <select 
                       value={settings.currency} 
                       onChange={e => setSettings({...settings, currency: e.target.value})}
                     >
                       <option value="KSh">KSh (Kenyan Shilling)</option>
                       <option value="USD">$ (US Dollar)</option>
                       <option value="EUR">€ (Euro)</option>
                     </select>
                  </div>
               </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;