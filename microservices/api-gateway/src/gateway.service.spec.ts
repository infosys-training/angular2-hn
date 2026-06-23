import { GatewayService, ServiceConfig } from './gateway.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.MockedFunction<typeof axios> & jest.Mocked<typeof axios>;

describe('GatewayService', () => {
    let service: GatewayService;

    const testServices: ServiceConfig[] = [
        { name: 'feed-service', url: 'http://localhost:3001', healthPath: '/health' },
        { name: 'item-service', url: 'http://localhost:3002', healthPath: '/health' },
        { name: 'user-service', url: 'http://localhost:3003', healthPath: '/health' },
    ];

    beforeEach(() => {
        service = new GatewayService(testServices);
        jest.clearAllMocks();
    });

    describe('getServiceUrl', () => {
        it('should return URL for known services', () => {
            expect(service.getServiceUrl('feed-service')).toBe('http://localhost:3001');
            expect(service.getServiceUrl('item-service')).toBe('http://localhost:3002');
            expect(service.getServiceUrl('user-service')).toBe('http://localhost:3003');
        });

        it('should return null for unknown services', () => {
            expect(service.getServiceUrl('unknown-service')).toBeNull();
        });
    });

    describe('proxyRequest', () => {
        it('should proxy request to the correct service', async () => {
            mockedAxios.mockResolvedValue({ data: { items: [] } } as any);

            const result = await service.proxyRequest('feed-service', '/api/feeds/news?page=1');

            expect(mockedAxios).toHaveBeenCalledWith({
                method: 'GET',
                url: 'http://localhost:3001/api/feeds/news?page=1',
                timeout: 15000,
            });
            expect(result).toEqual({ items: [] });
        });

        it('should throw error for unknown service', async () => {
            await expect(service.proxyRequest('unknown', '/api/test'))
                .rejects.toThrow('Unknown service: unknown');
        });
    });

    describe('checkServiceHealth', () => {
        it('should return healthy status when service responds', async () => {
            mockedAxios.get.mockResolvedValue({
                data: { status: 'healthy', uptime: 100 },
            });

            const health = await service.checkServiceHealth(testServices[0]);

            expect(health.service).toBe('feed-service');
            expect(health.status).toBe('healthy');
            expect(health.responseTimeMs).toBeGreaterThanOrEqual(0);
        });

        it('should return unhealthy status when service fails', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Connection refused'));

            const health = await service.checkServiceHealth(testServices[0]);

            expect(health.service).toBe('feed-service');
            expect(health.status).toBe('unhealthy');
        });
    });

    describe('getAggregatedHealth', () => {
        it('should report healthy when all services are healthy', async () => {
            mockedAxios.get.mockResolvedValue({
                data: { status: 'healthy' },
            });

            const health = await service.getAggregatedHealth();

            expect(health.gateway).toBe('api-gateway');
            expect(health.status).toBe('healthy');
            expect(health.services).toHaveLength(3);
            expect(health.services.every(s => s.status === 'healthy')).toBe(true);
        });

        it('should report degraded when some services are unhealthy', async () => {
            mockedAxios.get
                .mockResolvedValueOnce({ data: { status: 'healthy' } })
                .mockRejectedValueOnce(new Error('Down'))
                .mockResolvedValueOnce({ data: { status: 'healthy' } });

            const health = await service.getAggregatedHealth();

            expect(health.status).toBe('degraded');
        });

        it('should report unhealthy when all services are down', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Connection refused'));

            const health = await service.getAggregatedHealth();

            expect(health.status).toBe('unhealthy');
            expect(health.services.every(s => s.status === 'unhealthy')).toBe(true);
        });

        it('should include uptime and timestamp', async () => {
            mockedAxios.get.mockResolvedValue({ data: { status: 'healthy' } });

            const health = await service.getAggregatedHealth();

            expect(health.uptime).toBeGreaterThanOrEqual(0);
            expect(health.timestamp).toBeTruthy();
        });
    });
});
