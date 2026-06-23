import { Router, Request, Response } from 'express';
import { UserService } from './user.service';

export function createUserRouter(userService: UserService): Router {
    const router = Router();

    router.get('/health', (_req: Request, res: Response) => {
        res.json({
            service: 'user-service',
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            cacheStats: userService.getCacheStats(),
        });
    });

    router.get('/:id', async (req: Request, res: Response) => {
        try {
            const userId = req.params.id;

            if (!userId || userId.trim().length === 0) {
                return res.status(400).json({
                    error: 'Invalid user ID',
                    message: 'User ID must be a non-empty string',
                });
            }

            const user = await userService.fetchUser(userId);

            return res.json({
                ...user,
                _meta: {
                    accountAge: userService.getAccountAge(user),
                    cachedAt: new Date().toISOString(),
                },
            });
        } catch (error: any) {
            if (error.message?.includes('not found') || error.response?.status === 404) {
                return res.status(404).json({
                    error: 'User not found',
                    message: `No user found with ID: ${req.params.id}`,
                });
            }
            const status = error.response?.status || 500;
            return res.status(status).json({
                error: 'Failed to fetch user',
                message: error.message,
            });
        }
    });

    return router;
}
