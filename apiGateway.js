const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const { createClient } = require('redis');

// Import all configuration from the new config.js file
const config = require('./config');

const app = express();

// --- Redis Client Setup ---
// Use the REDIS_URL constructed in the config file
const redisClient = createClient({ url: config.REDIS_URL });

redisClient.on('error', (err) => console.error('Gateway Redis Client Error', err));
redisClient.on('connect', () => console.log('API Gateway connected to Redis'));
redisClient.connect();


/**
 * Middleware to verify JWT, check Redis blacklist, and authorize.
 */
const authenticateAndAuthorize = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1];
    try {
        // Use JWT_SECRET from the imported config
        const payload = jwt.verify(token, config.JWT_SECRET);
        const redisKey = `blacklist:${payload.jti}`;
        const isBlacklisted = await redisClient.get(redisKey);

        if (isBlacklisted) {
            return res.status(401).json({ error: 'Token has been revoked. Please log in again.' });
        }

        // Forward user info to downstream services
        req.headers['X-User-Username'] = payload.username;
        req.headers['X-User-Role'] = payload.role;
        req.headers['X-Token-Jti'] = payload.jti;
        req.headers['X-Token-Exp'] = payload.exp;

        delete req.headers.authorization;

        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: 'Token has expired' });
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
};

app.use(authenticateAndAuthorize);

// --- Proxy Routes ---
// Use service URLs from the imported config
app.use('/auth', createProxyMiddleware({ target: config.services.auth, changeOrigin: true, pathRewrite: { '^/auth': '' } }));
app.use('/transaction', createProxyMiddleware({ target: config.services.transaction, changeOrigin: true, pathRewrite: { '^/transaction': '' } }));
app.use('/category', createProxyMiddleware({ target: config.services.category, changeOrigin: true, pathRewrite: { '^/category': '' } }));

app.get('/health', (req, res) => res.json({ status: 'API Gateway running' }));
app.use('*', (req, res) => res.status(404).json({ error: 'Not Found on API Gateway' }));

// Use PORT from the imported config
app.listen(config.PORT, () => console.log(`API Gateway listening at http://localhost:${config.PORT}`));
