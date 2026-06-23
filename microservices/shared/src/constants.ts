export const HN_API_BASE_URL = 'https://node-hnapi.herokuapp.com';

export const VALID_FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

export const CACHE_TTL = {
    FEED: 120,      // 2 minutes
    ITEM: 300,      // 5 minutes
    USER: 900,      // 15 minutes
} as const;

export const SERVICE_PORTS = {
    GATEWAY: 3000,
    FEED: 3001,
    ITEM: 3002,
    USER: 3003,
} as const;

export const ITEMS_PER_PAGE = 30;
