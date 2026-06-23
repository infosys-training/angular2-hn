import { UserService, UserProfile } from './user.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UserService', () => {
    let service: UserService;

    const mockUser: UserProfile = {
        id: 'pg',
        created_time: 1160418111,
        created: '2006-10-09T18:21:51.000Z',
        karma: 155111,
        avg: null as any,
        about: 'Bug fixer.',
    };

    beforeEach(() => {
        service = new UserService();
        jest.clearAllMocks();
    });

    describe('fetchUser', () => {
        it('should fetch user from external API', async () => {
            mockedAxios.get.mockResolvedValue({ data: mockUser });

            const result = await service.fetchUser('pg');

            expect(result.id).toBe('pg');
            expect(result.karma).toBe(155111);
            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining('/user/pg'),
                expect.any(Object)
            );
        });

        it('should cache user results', async () => {
            mockedAxios.get.mockResolvedValue({ data: mockUser });

            await service.fetchUser('pg');
            const result = await service.fetchUser('pg');

            expect(result.id).toBe('pg');
            expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        });

        it('should trim and normalize user IDs', async () => {
            mockedAxios.get.mockResolvedValue({ data: mockUser });

            await service.fetchUser('  pg  ');

            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining('/user/pg'),
                expect.any(Object)
            );
        });

        it('should throw error for empty user ID', async () => {
            await expect(service.fetchUser('')).rejects.toThrow('User ID must be a non-empty string');
            await expect(service.fetchUser('   ')).rejects.toThrow('User ID must be a non-empty string');
        });

        it('should throw error when user not found', async () => {
            mockedAxios.get.mockResolvedValue({ data: null });

            await expect(service.fetchUser('nonexistent'))
                .rejects.toThrow('User not found: nonexistent');
        });

        it('should propagate API errors', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Network error'));

            await expect(service.fetchUser('pg'))
                .rejects.toThrow('Network error');
        });
    });

    describe('getAccountAge', () => {
        it('should calculate account age in years and days', () => {
            const user: UserProfile = {
                ...mockUser,
                created_time: Math.floor(Date.now() / 1000) - (2 * 365.25 * 24 * 3600 + 30 * 24 * 3600),
            };

            const age = service.getAccountAge(user);
            expect(age).toMatch(/2 years/);
        });

        it('should show days only for accounts less than a year old', () => {
            const user: UserProfile = {
                ...mockUser,
                created_time: Math.floor(Date.now() / 1000) - (100 * 24 * 3600),
            };

            const age = service.getAccountAge(user);
            expect(age).toMatch(/100 days/);
        });

        it('should return unknown for missing created_time', () => {
            const user: UserProfile = { ...mockUser, created_time: 0 };
            expect(service.getAccountAge(user)).toBe('unknown');
        });
    });

    describe('getCacheStats', () => {
        it('should track cache hits and misses', async () => {
            mockedAxios.get.mockResolvedValue({ data: mockUser });

            await service.fetchUser('pg');
            await service.fetchUser('pg');

            const stats = service.getCacheStats();
            expect(stats.hits).toBe(1);
            expect(stats.misses).toBe(1);
            expect(stats.keys).toBe(1);
        });
    });

    describe('clearCache', () => {
        it('should clear all cached entries', async () => {
            mockedAxios.get.mockResolvedValue({ data: mockUser });

            await service.fetchUser('pg');
            service.clearCache();

            expect(service.getCacheStats().keys).toBe(0);
        });
    });
});
