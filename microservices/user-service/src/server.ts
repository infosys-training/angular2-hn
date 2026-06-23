import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { UserService } from './user.service';
import { createUserRouter } from './user.controller';

const PORT = parseInt(process.env.PORT || '3003', 10);

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const userService = new UserService();
app.use('/api/users', createUserRouter(userService));

app.get('/health', (_req, res) => {
    res.json({
        service: 'user-service',
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

const server = app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});

export { app, server };
