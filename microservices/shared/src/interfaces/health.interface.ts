export interface IHealthCheck {
    service: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    timestamp: string;
    version: string;
    cacheStats?: {
        hits: number;
        misses: number;
        keys: number;
    };
}
