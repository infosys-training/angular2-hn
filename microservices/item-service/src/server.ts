import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ItemService } from './item.service';
import { createItemRouter } from './item.controller';

const PORT = parseInt(process.env.PORT || '3002', 10);

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const itemService = new ItemService();
app.use('/api/items', createItemRouter(itemService));

app.get('/health', (_req, res) => {
    res.json({
        service: 'item-service',
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

const server = app.listen(PORT, () => {
    console.log(`Item Service running on port ${PORT}`);
});

export { app, server };
