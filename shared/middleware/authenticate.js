require('dotenv').config();
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ status: 401, message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add user info (userId, role) to the request
        next();
    } catch (err) {
        res.status(401).json({ status: 401, message: 'Token is not valid' });
    }
};

module.exports = authenticate;