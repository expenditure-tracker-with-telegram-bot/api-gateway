require('dotenv').config();

/**
 * Centralized configuration for the API Gateway.
 * Reads values from the .env file.
 */
module.exports = {
    PORT: process.env.PORT || 5005,
    JWT_SECRET: process.env.JWT_SECRET,

    // Downstream service URLs
    services: {
        auth: process.env.AUTH_SERVICE_URL,
        transaction: process.env.TRANSACTION_SERVICE_URL,
        category: process.env.CATEGORY_SERVICE_URL,
    },

    // Build the Redis connection URL from individual environment variables.
    // This is the standard format for connecting to a password-protected Redis instance.
    REDIS_URL: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
};
