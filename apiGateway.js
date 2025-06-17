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

const proxyOptions = (target) => ({
    target: target,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        if (req.user) {
            // Note: Keys 'Username' and 'Role' are capitalized to match the Python JWT payload.
            proxyReq.setHeader('X-User', req.user.Username || '');
            proxyReq.setHeader('X-Role', req.user.Role || '');
        }
    },
});

app.use('/auth', createProxyMiddleware(proxyOptions(serviceTargets.auth)));

app.use(
    '/admin',
    authenticate,
    authRole('Admin'),
    createProxyMiddleware(proxyOptions(serviceTargets.auth))
);

app.use('/transaction', authenticate, createProxyMiddleware(proxyOptions(serviceTargets.transaction)));

app.use('/category', authenticate, createProxyMiddleware(proxyOptions(serviceTargets.category)));

app.listen(PORT, () => {
    console.log(`API Gateway is running on http://localhost:${PORT}`);
});