import { Router, Request, Response } from 'express';
import { ItemService } from './item.service';

export function createItemRouter(itemService: ItemService): Router {
    const router = Router();

    router.get('/health', (_req: Request, res: Response) => {
        res.json({
            service: 'item-service',
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            cacheStats: itemService.getCacheStats(),
        });
    });

    router.get('/:id', async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id, 10);

            if (isNaN(id) || id < 1) {
                return res.status(400).json({
                    error: 'Invalid item ID',
                    message: 'Item ID must be a positive integer',
                });
            }

            const item = await itemService.fetchItem(id);

            return res.json({
                ...item,
                _meta: {
                    cachedAt: new Date().toISOString(),
                    commentCount: itemService.countComments(item.comments),
                },
            });
        } catch (error: any) {
            if (error.response?.status === 404) {
                return res.status(404).json({
                    error: 'Item not found',
                    message: `No item found with ID: ${req.params.id}`,
                });
            }
            const status = error.response?.status || 500;
            return res.status(status).json({
                error: 'Failed to fetch item',
                message: error.message,
            });
        }
    });

    router.get('/:id/comments', async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id, 10);
            const flat = req.query.flat === 'true';
            const maxDepth = parseInt(req.query.maxDepth as string, 10) || -1;

            if (isNaN(id) || id < 1) {
                return res.status(400).json({
                    error: 'Invalid item ID',
                });
            }

            const item = await itemService.fetchItem(id);
            const comments = flat
                ? itemService.flattenComments(item.comments, maxDepth)
                : item.comments;

            return res.json({
                itemId: id,
                comments,
                totalCount: itemService.countComments(item.comments),
            });
        } catch (error: any) {
            const status = error.response?.status || 500;
            return res.status(status).json({
                error: 'Failed to fetch comments',
                message: error.message,
            });
        }
    });

    return router;
}
