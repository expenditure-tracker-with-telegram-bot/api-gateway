require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 5005,
    JWT_SECRET: process.env.JWT_SECRET,

    services: {
        auth: 'http://auth-service:5002',
        transaction: 'http://transaction-service:5004',
        category: 'http://category-service:5003',
    },

    REDIS_URL: process.env.REDIS_URL
};
