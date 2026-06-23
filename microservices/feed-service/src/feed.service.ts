import axios from 'axios';
import NodeCache from 'node-cache';

const HN_API_BASE_URL = process.env.HN_API_BASE_URL || 'https://node-hnapi.herokuapp.com';
const CACHE_TTL = parseInt(process.env.FEED_CACHE_TTL || '120', 10);
const VALID_FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'];

export interface FeedItem {
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    time_ago: string;
    type: string;
    url: string;
    domain: string;
    comments_count: number;
}

export class FeedService {
    private cache: NodeCache;
    private cacheHits = 0;
    private cacheMisses = 0;

    constructor() {
        this.cache = new NodeCache({
            stdTTL: CACHE_TTL,
            checkperiod: 60,
            useClones: true,
        });
    }

    isValidFeedType(feedType: string): boolean {
        return VALID_FEED_TYPES.includes(feedType);
    }

    async fetchFeed(feedType: string, page: number): Promise<FeedItem[]> {
        if (!this.isValidFeedType(feedType)) {
            throw new Error(`Invalid feed type: ${feedType}. Valid types: ${VALID_FEED_TYPES.join(', ')}`);
        }

        if (page < 1) {
            throw new Error('Page number must be >= 1');
        }

        const cacheKey = `feed:${feedType}:${page}`;
        const cached = this.cache.get<FeedItem[]>(cacheKey);

        if (cached) {
            this.cacheHits++;
            return cached;
        }

        this.cacheMisses++;

        const url = `${HN_API_BASE_URL}/${feedType}?page=${page}`;
        const response = await axios.get<FeedItem[]>(url, { timeout: 10000 });
        const items = response.data;

        this.cache.set(cacheKey, items);
        return items;
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
