// --- Final Corrected apiGateway.js ---
require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const authenticate = require('./shared/middleware/authenticate');
const authRole = require('./shared/middleware/authRole');

const app = express();
const PORT = process.env.PORT || 5005;

const serviceTargets = {
    auth: process.env.AUTH_SERVICE_URL,
    transaction: process.env.TRANSACTION_SERVICE_URL,
    category: process.env.CATEGORY_SERVICE_URL,
};

const onProxyReq = (proxyReq, req, res) => {
    if (req.user) {
        proxyReq.setHeader('X-User', req.user.Username || '');
        proxyReq.setHeader('X-Role', req.user.Role || '');
    }
};

// --- ROUTES ---

// 1. Public Auth routes
app.use('/auth', createProxyMiddleware({ target: serviceTargets.auth, changeOrigin: true, onProxyReq }));

// 2. Protected user routes
app.use('/transaction', authenticate, createProxyMiddleware({ target: serviceTargets.transaction, changeOrigin: true, onProxyReq }));
app.use('/category', authenticate, createProxyMiddleware({ target: serviceTargets.category, changeOrigin: true, onProxyReq }));

// 3. Protected Admin routes
app.use('/admin', authenticate, authRole('Admin'), createProxyMiddleware({ target: serviceTargets.auth, changeOrigin: true, onProxyReq }));


// Health check
app.get('/health', (req, res) => res.json({ status: 'API Gateway running' }));

// 404 handler for any routes not matched
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found on API Gateway' });
});

app.listen(PORT, () => {
    console.log(`API Gateway is running on http://localhost:${PORT}`);
});