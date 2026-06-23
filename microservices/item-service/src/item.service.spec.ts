import { ItemService, Comment, ItemDetails } from './item.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ItemService', () => {
    let service: ItemService;

    const mockItem: ItemDetails = {
        id: 12345,
        title: 'Test Item',
        points: 200,
        user: 'testuser',
        time: 1700000000,
        time_ago: '3 hours ago',
        type: 'story',
        url: 'https://example.com/test',
        domain: 'example.com',
        comments: [
            {
                id: 100,
                level: 0,
                user: 'commenter1',
                time: 1700000100,
                time_ago: '2 hours ago',
                content: 'Great article!',
                deleted: false,
                comments: [
                    {
                        id: 101,
                        level: 1,
                        user: 'commenter2',
                        time: 1700000200,
                        time_ago: '1 hour ago',
                        content: 'I agree!',
                        deleted: false,
                        comments: [],
                    },
                ],
            },
            {
                id: 102,
                level: 0,
                user: 'commenter3',
                time: 1700000300,
                time_ago: '30 minutes ago',
                content: '',
                deleted: true,
                comments: [],
            },
        ],
        comments_count: 3,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    };

    beforeEach(() => {
        service = new ItemService();
        jest.clearAllMocks();
    });

    describe('fetchItem', () => {
        it('should fetch item from external API', async () => {
            mockedAxios.get.mockResolvedValue({ data: mockItem });

            const result = await service.fetchItem(12345);

            expect(result.id).toBe(12345);
            expect(result.title).toBe('Test Item');
            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining('/item/12345'),
                expect.any(Object)
            );
        });

        it('should cache item results', async () => {
            mockedAxios.get.mockResolvedValue({ data: mockItem });

            await service.fetchItem(12345);
            const result = await service.fetchItem(12345);

            expect(result.id).toBe(12345);
            expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        });

        it('should throw error for invalid ID', async () => {
            await expect(service.fetchItem(0))
                .rejects.toThrow('Item ID must be a positive integer');
            await expect(service.fetchItem(-1))
                .rejects.toThrow('Item ID must be a positive integer');
        });

        it('should propagate API errors', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Network error'));

            await expect(service.fetchItem(12345))
                .rejects.toThrow('Network error');
        });
    });

    describe('countComments', () => {
        it('should count non-deleted comments recursively', () => {
            const count = service.countComments(mockItem.comments);
            expect(count).toBe(2); // commenter1 + commenter2, not deleted commenter3
        });

        it('should return 0 for empty comments', () => {
            expect(service.countComments([])).toBe(0);
        });

        it('should return 0 for null/undefined comments', () => {
            expect(service.countComments(null as any)).toBe(0);
            expect(service.countComments(undefined as any)).toBe(0);
        });
    });

    describe('flattenComments', () => {
        it('should flatten nested comments into a flat list', () => {
            const flat = service.flattenComments(mockItem.comments);

            expect(flat).toHaveLength(3);
            expect(flat[0].id).toBe(100);
            expect(flat[1].id).toBe(101);
            expect(flat[2].id).toBe(102);
        });

        it('should respect maxDepth parameter', () => {
            const flat = service.flattenComments(mockItem.comments, 0);

            expect(flat).toHaveLength(2); // Only top-level
            expect(flat[0].id).toBe(100);
            expect(flat[1].id).toBe(102);
        });

        it('should handle empty comments', () => {
            expect(service.flattenComments([])).toHaveLength(0);
        });
    });

    describe('getCacheStats', () => {
        it('should track cache hits and misses', async () => {
            mockedAxios.get.mockResolvedValue({ data: mockItem });

            await service.fetchItem(12345);
            await service.fetchItem(12345);

            const stats = service.getCacheStats();
            expect(stats.hits).toBe(1);
            expect(stats.misses).toBe(1);
            expect(stats.keys).toBe(1);
        });
    });

    describe('clearCache', () => {
        it('should clear all cached entries', async () => {
            mockedAxios.get.mockResolvedValue({ data: mockItem });

            await service.fetchItem(12345);
            service.clearCache();

            expect(service.getCacheStats().keys).toBe(0);
        });
    });
});
