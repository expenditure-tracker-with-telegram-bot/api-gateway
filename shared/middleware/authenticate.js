// shared/middleware/authenticate.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication token required' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // Attach user info to req.user
        req.user = {
            Username: payload.username,
            Role: payload.role
        };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
