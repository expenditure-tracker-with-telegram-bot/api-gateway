const authRole = (requiredRole) => {
    return (req, res, next) => {
        // Check if user is authenticated first
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Check if user has the required role
        const userRole = req.user.Role || req.user.role;

        if (!userRole) {
            return res.status(403).json({ error: 'No role assigned to user' });
        }

        if (userRole !== requiredRole) {
            return res.status(403).json({
                error: 'Forbidden: Insufficient permissions',
                required: requiredRole,
                current: userRole
            });
        }

        // User has the required role, proceed
        next();
    };
};

module.exports = authRole;