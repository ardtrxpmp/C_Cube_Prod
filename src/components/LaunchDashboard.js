import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CCubeLaunchMonitor from '../monitoring/LaunchMonitor';

const DashboardContainer = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
  color: white;
  border-radius: 12px;
  margin: 20px;
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 8px;
  margin: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.status === 'good' ? '#4ade80' : 
                   props.status === 'warning' ? '#fbbf24' : '#ef4444'};
`;

const MetricLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 4px;
`;

const AlertBanner = styled.div`
  background: ${props => props.severity === 'critical' ? '#dc2626' : '#f59e0b'};
  color: white;
  padding: 12px;
  border-radius: 6px;
  margin: 8px 0;
  font-weight: 600;
`;

const LaunchDashboard = () => {
  const [monitor] = useState(() => new CCubeLaunchMonitor());
  const [metrics, setMetrics] = useState({});
  const [alerts, setAlerts] = useState([]);
  
  useEffect(() => {
    const updateMetrics = () => {
      const dashboardData = monitor.getDashboardMetrics();
      setMetrics(dashboardData);
    };
    
    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Initial load
    
    return () => clearInterval(interval);
  }, [monitor]);
  
  const getStatusColor = (value, thresholds) => {
    if (value < thresholds.good) return 'good';
    if (value < thresholds.warning) return 'warning';
    return 'critical';
  };
  
  return (
    <DashboardContainer>
      <h2>🚀 C-Cube Launch Dashboard</h2>
      
      {alerts.length > 0 && (
        <div>
          <h3>🚨 Active Alerts</h3>
          {alerts.map((alert, index) => (
            <AlertBanner key={index} severity={alert.severity}>
              {alert.type}: {alert.message}
            </AlertBanner>
          ))}
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <MetricCard>
          <MetricValue status="good">
            {metrics.launchStatus?.isLive ? '🟢 LIVE' : '🔴 OFFLINE'}
          </MetricValue>
          <MetricLabel>Launch Status</MetricLabel>
        </MetricCard>
        
        <MetricCard>
          <MetricValue status={getStatusColor(metrics.performance?.errorRate || 0, { good: 2, warning: 5 })}>
            {(metrics.performance?.errorRate || 0).toFixed(2)}%
          </MetricValue>
          <MetricLabel>Error Rate</MetricLabel>
        </MetricCard>
        
        <MetricCard>
          <MetricValue status="good">
            {metrics.performance?.totalWalletsCreated || 0}
          </MetricValue>
          <MetricLabel>Wallets Created</MetricLabel>
        </MetricCard>
        
        <MetricCard>
          <MetricValue status="good">
            {metrics.performance?.successfulTransactions || 0}
          </MetricValue>
          <MetricLabel>Successful Transactions</MetricLabel>
        </MetricCard>
        
        <MetricCard>
          <MetricValue status={getStatusColor(metrics.performance?.averageResponseTime || 0, { good: 1000, warning: 2000 })}>
            {(metrics.performance?.averageResponseTime || 0).toFixed(0)}ms
          </MetricValue>
          <MetricLabel>Avg Response Time</MetricLabel>
        </MetricCard>
        
        <MetricCard>
          <MetricValue status="good">
            {metrics.userActivity?.activeUsers || 0}
          </MetricValue>
          <MetricLabel>Active Users</MetricLabel>
        </MetricCard>
        
        <MetricCard>
          <MetricValue status="good">
            {Math.floor((metrics.launchStatus?.duration || 0) / 1000 / 3600)}h {Math.floor(((metrics.launchStatus?.duration || 0) / 1000 % 3600) / 60)}m
          </MetricValue>
          <MetricLabel>Launch Duration</MetricLabel>
        </MetricCard>
        
        <MetricCard>
          <MetricValue status={getStatusColor(100 - (metrics.launchStatus?.uptime || 100), { good: 1, warning: 5 })}>
            {(metrics.launchStatus?.uptime || 100).toFixed(2)}%
          </MetricValue>
          <MetricLabel>Uptime</MetricLabel>
        </MetricCard>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '0.8rem', opacity: 0.7 }}>
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </DashboardContainer>
  );
};

export default LaunchDashboard;