import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { GatewayService } from './gateway.service';

const PORT = parseInt(process.env.PORT || '3000', 10);
const FEED_SERVICE_URL = process.env.FEED_SERVICE_URL || 'http://localhost:3001';
const ITEM_SERVICE_URL = process.env.ITEM_SERVICE_URL || 'http://localhost:3002';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3003';

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

const gatewayService = new GatewayService();

// Proxy routes to microservices
app.use('/api/feeds', createProxyMiddleware({
    target: FEED_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/feeds': '/api/feeds' },
    onError: (err, _req, res) => {
        (res as express.Response).status(502).json({
            error: 'Feed service unavailable',
            message: err.message,
        });
    },
}));

app.use('/api/items', createProxyMiddleware({
    target: ITEM_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/items': '/api/items' },
    onError: (err, _req, res) => {
        (res as express.Response).status(502).json({
            error: 'Item service unavailable',
            message: err.message,
        });
    },
}));

app.use('/api/users', createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/users': '/api/users' },
    onError: (err, _req, res) => {
        (res as express.Response).status(502).json({
            error: 'User service unavailable',
            message: err.message,
        });
    },
}));

// Backward-compatible routes (matching original HN API structure)
app.use('/news', createProxyMiddleware({
    target: FEED_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (_path, req) => `/api/feeds/news?page=${req.query.page || 1}`,
}));

app.use('/newest', createProxyMiddleware({
    target: FEED_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (_path, req) => `/api/feeds/newest?page=${req.query.page || 1}`,
}));

app.use('/show', createProxyMiddleware({
    target: FEED_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (_path, req) => `/api/feeds/show?page=${req.query.page || 1}`,
}));

app.use('/ask', createProxyMiddleware({
    target: FEED_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (_path, req) => `/api/feeds/ask?page=${req.query.page || 1}`,
}));

app.use('/jobs', createProxyMiddleware({
    target: FEED_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (_path, req) => `/api/feeds/jobs?page=${req.query.page || 1}`,
}));

app.use('/item', createProxyMiddleware({
    target: ITEM_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/item': '/api/items' },
}));

app.use('/user', createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/user': '/api/users' },
}));

// Health check endpoints
app.get('/health', async (_req, res) => {
    const health = await gatewayService.getAggregatedHealth();
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 207 : 503;
    res.status(statusCode).json(health);
});

app.get('/health/simple', (_req, res) => {
    res.json({
        service: 'api-gateway',
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

const server = app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log(`  Feed Service:  ${FEED_SERVICE_URL}`);
    console.log(`  Item Service:  ${ITEM_SERVICE_URL}`);
    console.log(`  User Service:  ${USER_SERVICE_URL}`);
});

export { app, server };
