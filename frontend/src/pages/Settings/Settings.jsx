import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Bell, Shield, 
  Smartphone, Globe, Moon, Sun, Trash2, 
  ChevronRight, Save, LogOut 
} from 'lucide-react';
import { Card, Button, Input, Modal } from '../../components/UI/UI';
import './Settings.css';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Account Settings</h1>
        <p className="text-muted">Manage your preferences and account security</p>
      </div>

      <div className="settings-grid">
        <aside className="settings-nav">
          <Card className="settings-nav-card" padding={false}>
            <button className="nav-item active">
              <Shield size={18} /> Account & Security
            </button>
            <button className="nav-item">
              <Bell size={18} /> Notifications
            </button>
            <button className="nav-item">
              <Globe size={18} /> Language & Region
            </button>
            <button className="nav-item">
              <Smartphone size={18} /> App Preferences
            </button>
          </Card>
        </aside>

        <main className="settings-content">
          {/* Account Security */}
          <section className="settings-section">
            <h2 className="section-title">Security Settings</h2>
            <Card className="settings-card">
              <div className="setting-row">
                <div className="setting-info">
                  <h3>Change Password</h3>
                  <p>Update your password to keep your account secure.</p>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
              <div className="divider"></div>
              <div className="setting-row">
                <div className="setting-info">
                  <h3>Two-Factor Authentication</h3>
                  <p>Add an extra layer of security to your account.</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </Card>
          </section>

          {/* Preferences */}
          <section className="settings-section mt-8">
            <h2 className="section-title">App Preferences</h2>
            <Card className="settings-card">
              <div className="setting-row">
                <div className="setting-info">
                  <h3>Appearance</h3>
                  <p>Toggle between light and dark mode.</p>
                </div>
                <button 
                  className={`toggle-switch ${darkMode ? 'on' : 'off'}`}
                  onClick={() => setDarkMode(!darkMode)}
                >
                  <div className="switch-handle">
                    {darkMode ? <Moon size={12} /> : <Sun size={12} />}
                  </div>
                </button>
              </div>
              <div className="divider"></div>
              <div className="setting-row">
                <div className="setting-info">
                  <h3>Email Notifications</h3>
                  <p>Receive order updates via email.</p>
                </div>
                <button 
                  className={`toggle-switch ${emailNotif ? 'on' : 'off'}`}
                  onClick={() => setEmailNotif(!emailNotif)}
                >
                  <div className="switch-handle"></div>
                </button>
              </div>
            </Card>
          </section>

          {/* Danger Zone */}
          <section className="settings-section mt-12">
            <h2 className="section-title text-danger">Danger Zone</h2>
            <Card className="settings-card border-danger">
              <div className="setting-row">
                <div className="setting-info">
                  <h3>Delete Account</h3>
                  <p>Permanently remove your account and all associated data.</p>
                </div>
                <Button variant="outline" size="sm" className="btn-danger-outline" onClick={() => setShowDeleteModal(true)}>Delete</Button>
              </div>
            </Card>
          </section>
        </main>
      </div>

      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        title="Delete Account"
      >
        <div style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
          <p>Are you absolutely sure you want to delete your account? This action is permanent and will completely wipe all your associated data from our servers.</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button style={{ background: '#ef4444', color: 'white', border: 'none' }} onClick={() => {
              // Add backend call later
              setShowDeleteModal(false);
            }}>Delete Permanently</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
