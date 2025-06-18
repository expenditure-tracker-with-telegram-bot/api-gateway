require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 5005,
    JWT_SECRET: process.env.JWT_SECRET,

    services: {
        auth: process.env.AUTH_SERVICE_URL,
        transaction: process.env.TRANSACTION_SERVICE_URL,
        category: process.env.CATEGORY_SERVICE_URL,
    },

    REDIS_URL: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
};
