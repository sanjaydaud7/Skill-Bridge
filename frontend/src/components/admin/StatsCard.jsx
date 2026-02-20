import React from 'react';
import '../../styles/StatsCard.css';

const StatsCard = ({ title, value, icon, trend, trendValue, color = 'blue' }) => {
  return (
    <div className={`stats-card stats-card-${color}`}>
      <div className="stats-card-header">
        <div className="stats-card-title">{title}</div>
        <div className="stats-card-icon">
          <span className="material-icons">{icon}</span>
        </div>
      </div>
      <div className="stats-card-body">
        <div className="stats-card-value">{value}</div>
        {trend && (
          <div className={`stats-card-trend ${trend === 'up' ? 'up' : 'down'}`}>
            <span className="material-icons">
              {trend === 'up' ? 'trending_up' : 'trending_down'}
            </span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
