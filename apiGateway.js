require('dotenv').config();
const express = require('express');
const proxy = require('express-http-proxy');
const authenticate = require('./shared/middleware/authenticate');
const authRole = require('./shared/middleware/authRole');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json()); // Parse JSON requests

// Public routes (no authentication required)
app.post('/userRegister/register', (req, res, next) => {
    // console.log("Request received at /userRegister");
    // console.log("Request body:", req.body);
    // console.log("Forwarding to /register...");
    next(); // Let the proxy middleware handle it
}, proxy(`http://localhost:${process.env.REGISTER_PORT}`, {
    proxyReqPathResolver: (req) => '/register',
    userResDecorator: (proxyRes, proxyResData) => {
        // console.log("INSIDE API GATEWAY USER REGISTER");
        return proxyResData;
    }
}));


app.post('/auth/login', (req, res, next) => {
    next(); // Let the proxy middleware handle it
}, proxy(`http://localhost:${process.env.LOGIN_PORT}`, {
    proxyReqPathResolver: (req) => '/login',
    userResDecorator: (proxyRes, proxyResData) => {
        return proxyResData;
    }
}));


// Protected routes (requires authentication)
// for user
app.use('/userCreate/blog/create', authenticate, (req, res, next) => {
    next(); // Let the proxy middleware handle it
}, proxy(`http://localhost:${process.env.CREATE_BLOG_PORT}`, {
    proxyReqPathResolver: (req) => '/blog/create',
    userResDecorator: (proxyRes, proxyResData) => {
        return proxyResData;
    }
}));

app.use('/userView/blog/view/:id', authenticate, (req, res, next) => {
    next(); // Let the proxy middleware handle it
}, proxy(`http://localhost:${process.env.VIEW_BLOG_PORT}`, {
    proxyReqPathResolver: (req) => '/blog/view/:id',
    userResDecorator: (proxyRes, proxyResData) => {
        return proxyResData;
    }
}));

// for admin
app.use('/adminUpdate/blog/update/:id', authenticate, authRole('admin'), (req, res, next) => {
    next(); // Let the proxy middleware handle it
}, proxy(`http://localhost:${process.env.UPDATE_BLOG_PORT}`, {
    proxyReqPathResolver: (req) => '/blog/update/:id',
    userResDecorator: (proxyRes, proxyResData) => {
        return proxyResData;
    }
}));

app.use('/adminDelete/blog/admin/delete/:id', authenticate, authRole('admin'), (req, res, next) => {
    next(); // Let the proxy middleware handle it
}, proxy(`http://localhost:${process.env.DELETE_BLOG_PORT}`, {
    proxyReqPathResolver: (req) => '/blog/admin/delete/:id',
    userResDecorator: (proxyRes, proxyResData) => {
        return proxyResData;
    }
}));


app.use('/adminView/blog/admin/all', authenticate, authRole('admin'), (req, res, next) => {
    next(); // Let the proxy middleware handle it
}, proxy(`http://localhost:${process.env.ADMIN_VIEW_PORT}`, {
    proxyReqPathResolver: (req) => '/blog/admin/all', 
    userResDecorator: (proxyRes, proxyResData) => {
        return proxyResData;
    }
}));


// Start the server
app.listen(port, () => {
    console.log(`API Gateway Service is running on PORT NO: ${port}`);
});
