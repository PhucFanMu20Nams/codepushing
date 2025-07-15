import React, { useState, useEffect } from 'react';
import { useFilter } from '../context/FilterContext';
import './FilterUpdateNotification.css';

const FilterUpdateNotification = () => {
  const { lastUpdated } = useFilter();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationTimer, setNotificationTimer] = useState(null);

  useEffect(() => {
    if (lastUpdated) {
      // Clear any existing timer
      if (notificationTimer) {
        clearTimeout(notificationTimer);
      }

      // Show notification
      setShowNotification(true);

      // Hide notification after 3 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);

      setNotificationTimer(timer);

      // Cleanup timer on unmount
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }
  }, [lastUpdated]);

  const handleClose = () => {
    setShowNotification(false);
    if (notificationTimer) {
      clearTimeout(notificationTimer);
    }
  };

  if (!showNotification) {
    return null;
  }

  return (
    <div className="filter-update-notification">
      <div className="notification-content">
        <div className="notification-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
        </div>
        <span className="notification-text">
          Filter options updated successfully
        </span>
        <button className="notification-close" onClick={handleClose}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FilterUpdateNotification;
