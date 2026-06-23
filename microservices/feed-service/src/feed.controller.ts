import { Router, Request, Response } from 'express';
import { FeedService } from './feed.service';

export function createFeedRouter(feedService: FeedService): Router {
    const router = Router();

    router.get('/health', (_req: Request, res: Response) => {
        res.json({
            service: 'feed-service',
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            cacheStats: feedService.getCacheStats(),
        });
    });

    router.get('/:feedType', async (req: Request, res: Response) => {
        try {
            const { feedType } = req.params;
            const page = parseInt(req.query.page as string, 10) || 1;

            if (!feedService.isValidFeedType(feedType)) {
                return res.status(400).json({
                    error: `Invalid feed type: ${feedType}`,
                    validTypes: ['news', 'newest', 'show', 'ask', 'jobs'],
                });
            }

            const items = await feedService.fetchFeed(feedType, page);

            return res.json({
                items,
                feedType,
                page,
                hasMore: items.length === 30,
                cachedAt: new Date().toISOString(),
            });
        } catch (error: any) {
            const status = error.response?.status || 500;
            return res.status(status).json({
                error: 'Failed to fetch feed',
                message: error.message,
            });
        }
    });

    return router;
}
