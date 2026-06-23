import axios from 'axios';
import NodeCache from 'node-cache';

const HN_API_BASE_URL = process.env.HN_API_BASE_URL || 'https://node-hnapi.herokuapp.com';
const CACHE_TTL = parseInt(process.env.USER_CACHE_TTL || '900', 10);

export interface UserProfile {
    id: string;
    created_time: number;
    created: string;
    karma: number;
    avg: number;
    about: string;
}

export class UserService {
    private cache: NodeCache;
    private cacheHits = 0;
    private cacheMisses = 0;

    constructor() {
        this.cache = new NodeCache({
            stdTTL: CACHE_TTL,
            checkperiod: 120,
            useClones: true,
        });
    }

    async fetchUser(userId: string): Promise<UserProfile> {
        if (!userId || userId.trim().length === 0) {
            throw new Error('User ID must be a non-empty string');
        }

        const normalizedId = userId.trim();
        const cacheKey = `user:${normalizedId}`;
        const cached = this.cache.get<UserProfile>(cacheKey);

        if (cached) {
            this.cacheHits++;
            return cached;
        }

        this.cacheMisses++;

        const url = `${HN_API_BASE_URL}/user/${normalizedId}`;
        const response = await axios.get<UserProfile>(url, { timeout: 10000 });
        const user = response.data;

        if (!user || !user.id) {
            throw new Error(`User not found: ${normalizedId}`);
        }

        this.cache.set(cacheKey, user);
        return user;
    }

    getAccountAge(user: UserProfile): string {
        if (!user.created_time) return 'unknown';

        const now = Math.floor(Date.now() / 1000);
        const diffSeconds = now - user.created_time;

        const years = Math.floor(diffSeconds / (365.25 * 24 * 3600));
        const days = Math.floor((diffSeconds % (365.25 * 24 * 3600)) / (24 * 3600));

        if (years > 0) {
            return `${years} year${years !== 1 ? 's' : ''}, ${days} day${days !== 1 ? 's' : ''}`;
        }
        return `${days} day${days !== 1 ? 's' : ''}`;
    }

    getCacheStats() {
        return {
            hits: this.cacheHits,
            misses: this.cacheMisses,
            keys: this.cache.keys().length,
        };
    }

    clearCache(): void {
        this.cache.flushAll();
    }
}
