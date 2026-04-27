import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Bell, Shield, 
  Palette, Globe, Save, RefreshCw,
  Lock, Mail, Building2,
  Link as LinkIcon
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../../context/AdminAuthContext';
import './Settings.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const Settings = () => {
  const { adminToken: token } = useAdminAuth();
  const url = API_URL;
  const [activeTab, setActiveTab] = useState('business');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    businessCity: '',
    businessCountry: '',
    businessWebsite: '',
    businessPin: '',
    businessVat: '',
    invoicePrefix: '',
    currency: 'KSh',
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${url}/api/settings/get`, { headers: { token } });
      if (response.data.success && response.data.data) {
        setFormData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (token) fetchSettings();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const socialKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [socialKey]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${url}/api/settings/update`, formData, { headers: { token } });
      if (response.data.success) {
        toast.success('Business settings updated');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error updating settings");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="settings-loading">Loading configuration...</div>;

  return (
    <div className="settings-page">
      <header className="premium-page-header">
        <div className="header-info-flex">
          <div className="header-icon-container">
            <SettingsIcon size={28} />
          </div>
          <div className="header-titles">
            <h1>System Settings</h1>
            <p>Configure and personalize your business identity and admin panel</p>
          </div>
        </div>
        <div className="header-action-items">
          <button className="premium-save-btn" onClick={handleSave} disabled={loading}>
            {loading ? <RefreshCw className="spinner" size={18} /> : <Save size={18} />}
            <span>Save Changes</span>
          </button>
        </div>
      </header>

      <div className="settings-grid">
        <div className="settings-sidebar">
          <button 
            className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`}
            onClick={() => setActiveTab('business')}
          >
            <Building2 size={18} /> Business Identity
          </button>
          <button 
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <Globe size={18} /> General
          </button>
          <button 
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={18} /> Security
          </button>
          <button 
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} /> Notifications
          </button>
          <button 
            className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <Palette size={18} /> Appearance
          </button>
        </div>

        <div className="settings-content">
          <div className="premium-card settings-card">
            {activeTab === 'business' && (
              <div className="tab-pane">
                <div className="pane-header">
                  <div className="pane-title-group">
                    <Building2 className="title-icon" size={24} />
                    <div>
                      <h3>Business Identity</h3>
                      <p>Used for invoicing, emails, and brand recognition</p>
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <h4 className="section-subtitle">Basic Information</h4>
                  <div className="settings-form-grid">
                    <div className="form-group">
                      <label>Business Name</label>
                      <input name="businessName" value={formData.businessName} onChange={handleChange} placeholder="e.g. Urban Foods Ltd" />
                    </div>
                    <div className="form-group">
                      <label>Business Email</label>
                      <input name="businessEmail" value={formData.businessEmail} onChange={handleChange} placeholder="billing@urbanfoods.com" />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input name="businessPhone" value={formData.businessPhone} onChange={handleChange} placeholder="+254 700 000 000" />
                    </div>
                    <div className="form-group">
                      <label>Website URL</label>
                      <div className="input-with-icon">
                        <LinkIcon size={14} />
                        <input name="businessWebsite" value={formData.businessWebsite} onChange={handleChange} placeholder="www.urbanfoods.com" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <h4 className="section-subtitle">Location & Address</h4>
                  <div className="settings-form-grid">
                    <div className="form-group span-2">
                      <label>Street Address</label>
                      <input name="businessAddress" value={formData.businessAddress} onChange={handleChange} placeholder="Building name, Street..." />
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input name="businessCity" value={formData.businessCity} onChange={handleChange} placeholder="Nairobi" />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <input name="businessCountry" value={formData.businessCountry} onChange={handleChange} placeholder="Kenya" />
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <h4 className="section-subtitle">Tax & Financials</h4>
                  <div className="settings-form-grid">
                    <div className="form-group">
                      <label>KRA PIN</label>
                      <input name="businessPin" value={formData.businessPin} onChange={handleChange} placeholder="P000..." />
                    </div>
                    <div className="form-group">
                      <label>VAT Number (Optional)</label>
                      <input name="businessVat" value={formData.businessVat} onChange={handleChange} placeholder="VAT-..." />
                    </div>
                    <div className="form-group">
                      <label>Invoice Prefix</label>
                      <input name="invoicePrefix" value={formData.invoicePrefix} onChange={handleChange} placeholder="INV-" />
                    </div>
                    <div className="form-group">
                      <label>Preferred Currency</label>
                      <select name="currency" value={formData.currency} onChange={handleChange}>
                        <option value="KSh">KSh (Kenyan Shilling)</option>
                        <option value="$">$ (USD)</option>
                        <option value="€">€ (Euro)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <h4 className="section-subtitle">Social Profiles</h4>
                  <div className="settings-form-grid">
                    <div className="form-group">
                      <label>
                        <span className="social-icon-label facebook">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        </span>
                        Facebook
                      </label>
                      <input name="social.facebook" value={formData.socialLinks?.facebook || ''} onChange={handleChange} placeholder="facebook.com/username" />
                    </div>
                    <div className="form-group">
                      <label>
                        <span className="social-icon-label instagram">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        </span>
                        Instagram
                      </label>
                      <input name="social.instagram" value={formData.socialLinks?.instagram || ''} onChange={handleChange} placeholder="instagram.com/username" />
                    </div>
                    <div className="form-group">
                      <label>
                        <span className="social-icon-label twitter">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </span>
                        Twitter (X)
                      </label>
                      <input name="social.twitter" value={formData.socialLinks?.twitter || ''} onChange={handleChange} placeholder="twitter.com/username" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="tab-pane">
                <div className="pane-header">
                  <div className="pane-title-group">
                    <Globe className="title-icon" size={24} />
                    <div>
                      <h3>General Configuration</h3>
                      <p>System-wide defaults and maintenance</p>
                    </div>
                  </div>
                </div>
                <div className="form-group mt-4">
                  <label>Store Name Display</label>
                  <input type="text" defaultValue="Urban Foods Admin" />
                </div>
                <div className="toggle-group mt-6">
                   <div>
                     <strong>Maintenance Mode</strong>
                     <p>Disable client-side access during updates</p>
                   </div>
                   <input type="checkbox" className="toggle-switch" />
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="tab-pane">
                <div className="pane-header">
                  <div className="pane-title-group">
                    <Shield className="title-icon" size={24} />
                    <div>
                      <h3>Security & Access</h3>
                      <p>Manage authentication and access logs</p>
                    </div>
                  </div>
                </div>
                <div className="security-alert mt-4">
                  <Lock size={20} />
                  <div>
                    <strong>Two-Factor Authentication</strong>
                    <p>Add an extra layer of security to your account.</p>
                  </div>
                  <button className="action-btn-sm">Enable</button>
                </div>
                <div className="toggle-group mt-6">
                   <div>
                     <strong>Audit Logging</strong>
                     <p>Record every admin action in the security trail</p>
                   </div>
                   <input type="checkbox" className="toggle-switch" defaultChecked />
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="tab-pane">
                 <div className="pane-header">
                  <div className="pane-title-group">
                    <Bell className="title-icon" size={24} />
                    <div>
                      <h3>Notifications</h3>
                      <p>Control how you receive system alerts</p>
                    </div>
                  </div>
                </div>
                <div className="notification-row mt-4">
                  <Mail size={20} />
                  <div>
                    <strong>Email Alerts</strong>
                    <p>Get notified about new orders and security events</p>
                  </div>
                  <input type="checkbox" className="toggle-switch" defaultChecked />
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="tab-pane">
                 <div className="pane-header">
                  <div className="pane-title-group">
                    <Palette className="title-icon" size={24} />
                    <div>
                      <h3>Appearance</h3>
                      <p>Customize the look and feel of your dashboard</p>
                    </div>
                  </div>
                </div>
                <div className="appearance-grid mt-4">
                  <div className="theme-option active">
                    <div className="theme-preview light"></div>
                    <span>Light Mode</span>
                  </div>
                  <div className="theme-option">
                    <div className="theme-preview dark"></div>
                    <span>Dark Mode</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
