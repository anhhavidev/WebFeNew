import React from 'react';

export default function ToastAlert({ alert, onClose }) {
  if (!alert.visible) return null;
  return (
    <div className={`cp-alert ${alert.type} ${alert.fading ? "fading" : ""}`}>
      {alert.message}
      <button className="cp-alert-close" onClick={onClose}>✕</button>
    </div>
  );
}
