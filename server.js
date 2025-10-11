const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3334;

// Middleware
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import the API routes
const deployTokenRoute = require('./api/deploy-token');
const launchedTokensRoute = require('./api/tokens/launched');

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/deploy-token', deployTokenRoute);
app.get('/api/tokens/launched', launchedTokensRoute);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'C-Cube Token Deployment API Server',
    status: 'running',
    endpoints: {
      health: '/api/health',
      deployToken: '/api/deploy-token'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API server is running' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
  console.log(`Deploy token endpoint at http://localhost:${PORT}/api/deploy-token`);
  console.log('Server is ready to accept requests...');
});

// Keep the server running
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Keep the process alive
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

// Prevent process from exiting
setInterval(() => {
  // Keep alive
}, 60000);

module.exports = app;