import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { FeedService } from './feed.service';
import { createFeedRouter } from './feed.controller';

const PORT = parseInt(process.env.PORT || '3001', 10);

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const feedService = new FeedService();
app.use('/api/feeds', createFeedRouter(feedService));

app.get('/health', (_req, res) => {
    res.json({
        service: 'feed-service',
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

const server = app.listen(PORT, () => {
    console.log(`Feed Service running on port ${PORT}`);
});

export { app, server };
