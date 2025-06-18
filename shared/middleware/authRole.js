// shared/middleware/authRole.js
module.exports = (requiredRole) => (req, res, next) => {
    if (!req.user || req.user.Role !== requiredRole) {
        return res.status(403).json({ error: `${requiredRole} access required` });
    }
    next();
};
