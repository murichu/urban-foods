import React, { useState } from 'react';
import { 
  Bell, BellOff, CheckCircle2, Info, 
  AlertTriangle, Trash2, Clock, Check 
} from 'lucide-react';
import { Card, Button, Badge } from '../../components/UI/UI';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Order Delivered!",
      message: "Your order #ORD12345 has been successfully delivered. Enjoy your meal!",
      type: "success",
      time: "2 hours ago",
      read: false
    },
    {
      id: 2,
      title: "M-Pesa Payment Successful",
      message: "Payment of Ksh 1,200 for your latest order was received.",
      type: "info",
      time: "5 hours ago",
      read: true
    },
    {
      id: 3,
      title: "Flash Sale Alert",
      message: "Get 30% off on all desserts for the next 2 hours. Don't miss out!",
      type: "warning",
      time: "1 day ago",
      read: true
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: !n.read } : n
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle2 className="text-green" />;
      case 'warning': return <AlertTriangle className="text-yellow" />;
      default: return <Info className="text-blue" />;
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p className="text-muted">Stay updated with your orders and special offers</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" size="sm" onClick={markAllAsRead} icon={Check}>Mark all as read</Button>
          <Button variant="outline" size="sm" onClick={clearAll} icon={Trash2}>Clear all</Button>
        </div>
      </div>

      <div className="notifications-container">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <Card key={n.id} className={`notification-card ${n.read ? 'read' : 'unread'}`} hover>
              <div className="notification-content">
                <div className={`notification-icon-box ${n.type}`}>
                  {getIcon(n.type)}
                </div>
                <div className="notification-text">
                  <div className="notification-title-row">
                    <h3>{n.title}</h3>
                    {!n.read && <Badge variant="danger" className="new-badge">New</Badge>}
                  </div>
                  <p>{n.message}</p>
                  <div className="notification-meta">
                    <Clock size={12} />
                    <span>{n.time}</span>
                  </div>
                </div>
              </div>
              <div className="notification-actions">
                <Button variant="outline" size="sm" onClick={() => toggleRead(n.id)}>
                  {n.read ? 'Mark as unread' : 'Mark as read'}
                </Button>
                <Button variant="outline" size="sm" className="delete-btn" onClick={() => deleteNotification(n.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="empty-notifications text-center">
            <BellOff size={64} className="notifications-empty-icon" />
            <h2>All Caught Up!</h2>
            <p className="text-muted">You don't have any new notifications at the moment.</p>
            <Button variant="primary" className="mt-8" onClick={() => window.location.reload()}>Refresh</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Notifications;
