import { FeedService } from './feed.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FeedService', () => {
    let service: FeedService;

    const mockFeedItems = [
        {
            id: 1,
            title: 'Test Story',
            points: 100,
            user: 'testuser',
            time: 1700000000,
            time_ago: '2 hours ago',
            type: 'story',
            url: 'https://example.com',
            domain: 'example.com',
            comments_count: 42,
        },
        {
            id: 2,
            title: 'Another Story',
            points: 50,
            user: 'anotheruser',
            time: 1700000100,
            time_ago: '1 hour ago',
            type: 'story',
            url: 'https://example.org',
            domain: 'example.org',
            comments_count: 10,
        },
    ];

    beforeEach(() => {
        service = new FeedService();
        jest.clearAllMocks();
    });

    describe('isValidFeedType', () => {
        it('should return true for valid feed types', () => {
            expect(service.isValidFeedType('news')).toBe(true);
            expect(service.isValidFeedType('newest')).toBe(true);
            expect(service.isValidFeedType('show')).toBe(true);
            expect(service.isValidFeedType('ask')).toBe(true);
            expect(service.isValidFeedType('jobs')).toBe(true);
        });

        it('should return false for invalid feed types', () => {
            expect(service.isValidFeedType('invalid')).toBe(false);
            expect(service.isValidFeedType('')).toBe(false);
            expect(service.isValidFeedType('NEWS')).toBe(false);
        });
    });

    describe('fetchFeed', () => {
        it('should fetch feed from external API', async () => {
            mockedAxios.get.mockResolvedValue({ data: mockFeedItems });

            const result = await service.fetchFeed('news', 1);

            expect(result).toEqual(mockFeedItems);
            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining('/news?page=1'),
                expect.any(Object)
            );
        });

        it('should cache feed results', async () => {
            mockedAxios.get.mockResolvedValue({ data: mockFeedItems });

            await service.fetchFeed('news', 1);
            const result = await service.fetchFeed('news', 1);

            expect(result).toEqual(mockFeedItems);
            expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        });

        it('should use separate cache keys per feed type and page', async () => {
            mockedAxios.get.mockResolvedValue({ data: mockFeedItems });

            await service.fetchFeed('news', 1);
            await service.fetchFeed('show', 1);
            await service.fetchFeed('news', 2);

            expect(mockedAxios.get).toHaveBeenCalledTimes(3);
        });

        it('should throw error for invalid feed type', async () => {
            await expect(service.fetchFeed('invalid', 1))
                .rejects.toThrow('Invalid feed type: invalid');
        });

        it('should throw error for page < 1', async () => {
            await expect(service.fetchFeed('news', 0))
                .rejects.toThrow('Page number must be >= 1');
        });

        it('should propagate API errors', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Network error'));

            await expect(service.fetchFeed('news', 1))
                .rejects.toThrow('Network error');
        });
    });

    describe('getCacheStats', () => {
        it('should track cache hits and misses', async () => {
            mockedAxios.get.mockResolvedValue({ data: mockFeedItems });

            await service.fetchFeed('news', 1);
            await service.fetchFeed('news', 1);
            await service.fetchFeed('show', 1);

            const stats = service.getCacheStats();
            expect(stats.hits).toBe(1);
            expect(stats.misses).toBe(2);
            expect(stats.keys).toBe(2);
        });
    });

    describe('clearCache', () => {
        it('should clear all cached entries', async () => {
            mockedAxios.get.mockResolvedValue({ data: mockFeedItems });

            await service.fetchFeed('news', 1);
            service.clearCache();

            const stats = service.getCacheStats();
            expect(stats.keys).toBe(0);
        });
    });
});
