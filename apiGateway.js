const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const { createClient } = require('redis');

const config = require('./config');

const app = express();

const redisClient = createClient({ url: config.REDIS_URL });
redisClient.on('error', (err) => console.error('Gateway Redis Client Error', err));
redisClient.on('connect', () => console.log('API Gateway connected to Redis'));
redisClient.connect();


const authenticateAndAuthorize = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, config.JWT_SECRET);
        const redisKey = `blacklist:${payload.jti}`;
        const isBlacklisted = await redisClient.get(redisKey);

        if (isBlacklisted) {
            return res.status(401).json({ error: 'Token has been revoked. Please log in again.' });
        }

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
app.use('/auth', createProxyMiddleware({ target: config.services.auth, changeOrigin: true, pathRewrite: { '^/auth': '' } }));
app.use('/transaction', createProxyMiddleware({ target: config.services.transaction, changeOrigin: true, pathRewrite: { '^/transaction': '' } }));
app.use('/category', createProxyMiddleware({ target: config.services.category, changeOrigin: true, pathRewrite: { '^/category': '' } }));

app.get('/health', (req, res) => res.json({ status: 'API Gateway running' }));
app.use('*', (req, res) => res.status(404).json({ error: 'Not Found on API Gateway' }));

app.listen(config.PORT, () => console.log(`API Gateway listening at http://localhost:${config.PORT}`));
