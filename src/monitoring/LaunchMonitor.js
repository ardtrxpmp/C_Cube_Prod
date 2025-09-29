// Launch Performance Monitor for C-Cube
class CCubeLaunchMonitor {
  constructor(config = {}) {
    this.config = {
      apiEndpoint: config.apiEndpoint || '/api/metrics',
      alertThresholds: config.alertThresholds || {
        responseTime: 2000,
        errorRate: 5,
        gasPrice: 50
      },
      ...config
    };
    
    this.metrics = new Map();
    this.startTime = Date.now();
  }
  
  // Monitor wallet creation during launch
  trackWalletCreation(walletType, duration, success) {
    const metric = {
      type: 'wallet_creation',
      walletType,
      duration,
      success,
      timestamp: Date.now()
    };
    
    this.recordMetric('wallet_creation', metric);
    
    if (!success) {
      this.sendAlert('wallet_creation_failed', metric);
    }
  }
  
  // Monitor transaction broadcasting
  trackTransaction(txData) {
    const startTime = Date.now();
    
    return {
      onBroadcast: (txHash) => {
        const broadcastTime = Date.now() - startTime;
        this.recordMetric('transaction_broadcast', {
          txHash,
          broadcastTime,
          gasPrice: txData.gasPrice,
          timestamp: Date.now()
        });
      },
      
      onConfirmed: (confirmations) => {
        const confirmationTime = Date.now() - startTime;
        this.recordMetric('transaction_confirmed', {
          confirmationTime,
          confirmations,
          timestamp: Date.now()
        });
      },
      
      onFailed: (error) => {
        this.recordMetric('transaction_failed', {
          error: error.message,
          gasPrice: txData.gasPrice,
          timestamp: Date.now()
        });
        
        this.sendAlert('transaction_failure_spike', error);
      }
    };
  }
  
  // Monitor user interactions
  trackUserInteraction(action, metadata = {}) {
    this.recordMetric('user_interaction', {
      action,
      metadata,
      timestamp: Date.now(),
      sessionId: this.getSessionId()
    });
  }
  
  // Record metrics
  recordMetric(type, data) {
    if (!this.metrics.has(type)) {
      this.metrics.set(type, []);
    }
    
    this.metrics.get(type).push(data);
    
    // Send to monitoring service
    this.sendToMonitoringService(type, data);
  }
  
  // Send alerts
  sendAlert(alertType, data) {
    console.warn(`🚨 LAUNCH ALERT: ${alertType}`, data);
    
    // Send to alerting service (Slack, PagerDuty, etc.)
    fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: alertType,
        data,
        timestamp: Date.now(),
        severity: this.getAlertSeverity(alertType)
      })
    });
  }
  
  // Generate launch dashboard data
  getDashboardMetrics() {
    const now = Date.now();
    const launchDuration = now - this.startTime;
    
    return {
      launchStatus: {
        isLive: this.isLaunchLive(),
        duration: launchDuration,
        uptime: this.calculateUptime()
      },
      
      performance: {
        totalWalletsCreated: this.getMetricCount('wallet_creation'),
        successfulTransactions: this.getSuccessfulTransactions(),
        averageResponseTime: this.getAverageResponseTime(),
        errorRate: this.getErrorRate()
      },
      
      userActivity: {
        activeUsers: this.getActiveUsers(),
        peakConcurrentUsers: this.getPeakConcurrentUsers(),
        userRetentionRate: this.getUserRetentionRate()
      }
    };
  }
  
  // Helper methods
  getSessionId() {
    return localStorage.getItem('sessionId') || 'anonymous';
  }
  
  getMetricCount(type) {
    return this.metrics.get(type)?.length || 0;
  }
  
  getSuccessfulTransactions() {
    const confirmed = this.metrics.get('transaction_confirmed') || [];
    return confirmed.length;
  }
  
  getAverageResponseTime() {
    const interactions = this.metrics.get('user_interaction') || [];
    if (interactions.length === 0) return 0;
    
    const totalTime = interactions.reduce((sum, metric) => 
      sum + (metric.metadata.responseTime || 0), 0);
    
    return totalTime / interactions.length;
  }
  
  getErrorRate() {
    const total = this.getMetricCount('wallet_creation') + 
                 this.getMetricCount('transaction_broadcast');
    const errors = this.getMetricCount('transaction_failed');
    
    return total > 0 ? (errors / total) * 100 : 0;
  }
  
  sendToMonitoringService(type, data) {
    // Integration with monitoring services
    if (window.gtag) {
      window.gtag('event', type, {
        custom_parameter: JSON.stringify(data)
      });
    }
    
    // Send to your analytics endpoint
    fetch(this.config.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data })
    }).catch(err => console.error('Failed to send metrics:', err));
  }
}

export default CCubeLaunchMonitor;