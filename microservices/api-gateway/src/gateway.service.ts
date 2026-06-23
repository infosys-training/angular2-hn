import axios, { AxiosError } from 'axios';

export interface ServiceConfig {
    name: string;
    url: string;
    healthPath: string;
}

export interface ServiceHealth {
    service: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTimeMs: number;
    details?: Record<string, unknown>;
}

const DEFAULT_SERVICES: ServiceConfig[] = [
    {
        name: 'feed-service',
        url: process.env.FEED_SERVICE_URL || 'http://localhost:3001',
        healthPath: '/health',
    },
    {
        name: 'item-service',
        url: process.env.ITEM_SERVICE_URL || 'http://localhost:3002',
        healthPath: '/health',
    },
    {
        name: 'user-service',
        url: process.env.USER_SERVICE_URL || 'http://localhost:3003',
        healthPath: '/health',
    },
];

export class GatewayService {
    private services: ServiceConfig[];
    private startTime: number;

    constructor(services?: ServiceConfig[]) {
        this.services = services || DEFAULT_SERVICES;
        this.startTime = Date.now();
    }

    getServiceUrl(serviceName: string): string | null {
        const service = this.services.find(s => s.name === serviceName);
        return service ? service.url : null;
    }

    async proxyRequest(serviceName: string, path: string, method: string = 'GET'): Promise<unknown> {
        const serviceUrl = this.getServiceUrl(serviceName);
        if (!serviceUrl) {
            throw new Error(`Unknown service: ${serviceName}`);
        }

        const url = `${serviceUrl}${path}`;
        const response = await axios({ method, url, timeout: 15000 });
        return response.data;
    }

    async checkServiceHealth(service: ServiceConfig): Promise<ServiceHealth> {
        const start = Date.now();
        try {
            const response = await axios.get(`${service.url}${service.healthPath}`, {
                timeout: 5000,
            });
            return {
                service: service.name,
                status: 'healthy',
                responseTimeMs: Date.now() - start,
                details: response.data,
            };
        } catch (error) {
            return {
                service: service.name,
                status: 'unhealthy',
                responseTimeMs: Date.now() - start,
                details: {
                    error: (error as AxiosError).message,
                },
            };
        }
    }

    async getAggregatedHealth(): Promise<{
        gateway: string;
        status: string;
        uptime: number;
        timestamp: string;
        services: ServiceHealth[];
    }> {
        const healthChecks = await Promise.all(
            this.services.map(s => this.checkServiceHealth(s))
        );

        const allHealthy = healthChecks.every(h => h.status === 'healthy');
        const anyUnhealthy = healthChecks.some(h => h.status === 'unhealthy');

        let overallStatus = 'healthy';
        if (anyUnhealthy && !allHealthy) overallStatus = 'degraded';
        if (healthChecks.every(h => h.status === 'unhealthy')) overallStatus = 'unhealthy';

        return {
            gateway: 'api-gateway',
            status: overallStatus,
            uptime: (Date.now() - this.startTime) / 1000,
            timestamp: new Date().toISOString(),
            services: healthChecks,
        };
    }
}
