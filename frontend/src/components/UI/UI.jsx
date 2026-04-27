import React from 'react';
import './UI.css';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false, 
  onClick,
  type = 'button',
  icon: Icon
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${variant} btn-${size} ${className} ${disabled ? 'disabled' : ''}`}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="btn-icon" />}
      {children}
    </button>
  );
};

export const Card = ({ 
  children, 
  className = '', 
  padding = true, 
  hover = false,
  glass = false 
}) => {
  return (
    <div className={`ui-card ${padding ? 'padding' : ''} ${hover ? 'hover' : ''} ${glass ? 'glass' : ''} ${className}`}>
      {children}
    </div>
  );
};

export const Input = ({ 
  label, 
  error, 
  className = '', 
  icon: Icon,
  ...props 
}) => {
  return (
    <div className={`ui-input-group ${className}`}>
      {label && <label className="ui-label">{label}</label>}
      <div className={`ui-input-wrapper ${error ? 'error' : ''}`}>
        {Icon && <Icon className="ui-input-icon" size={18} />}
        <input className="ui-input" {...props} />
      </div>
      {error && <span className="ui-error-msg">{error}</span>}
    </div>
  );
};

export const Badge = ({ 
  children, 
  variant = 'default', 
  className = '' 
}) => {
  return (
    <span className={`ui-badge ui-badge-${variant} ${className}`}>
      {children}
    </span>
  );
};

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="ui-modal-overlay">
      <div className="ui-modal-container">
        <div className="ui-modal-header">
          <h3>{title}</h3>
          <button className="ui-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="ui-modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};
