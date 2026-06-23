import axios from 'axios';
import NodeCache from 'node-cache';

const HN_API_BASE_URL = process.env.HN_API_BASE_URL || 'https://node-hnapi.herokuapp.com';
const CACHE_TTL = parseInt(process.env.ITEM_CACHE_TTL || '300', 10);

export interface Comment {
    id: number;
    level: number;
    user: string;
    time: number;
    time_ago: string;
    content: string;
    deleted: boolean;
    comments: Comment[];
}

export interface PollResult {
    points: number;
    content: string;
}

export interface ItemDetails {
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    time_ago: string;
    type: string;
    url: string;
    domain: string;
    comments: Comment[];
    comments_count: number;
    poll: PollResult[];
    poll_votes_count: number;
    deleted: boolean;
    dead: boolean;
}

export class ItemService {
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

    async fetchItem(id: number): Promise<ItemDetails> {
        if (!id || id < 1) {
            throw new Error('Item ID must be a positive integer');
        }

        const cacheKey = `item:${id}`;
        const cached = this.cache.get<ItemDetails>(cacheKey);

        if (cached) {
            this.cacheHits++;
            return cached;
        }

        this.cacheMisses++;

        const url = `${HN_API_BASE_URL}/item/${id}`;
        const response = await axios.get<ItemDetails>(url, { timeout: 10000 });
        const item = response.data;

        if (item.type === 'poll' && item.poll && item.poll.length > 0) {
            await this.enrichPollData(item);
        }

        this.cache.set(cacheKey, item);
        return item;
    }

    private async enrichPollData(item: ItemDetails): Promise<void> {
        const pollCount = item.poll.length;
        item.poll_votes_count = 0;

        const pollPromises = [];
        for (let i = 1; i <= pollCount; i++) {
            pollPromises.push(this.fetchPollOption(item.id + i));
        }

        const pollResults = await Promise.allSettled(pollPromises);

        for (let i = 0; i < pollResults.length; i++) {
            const result = pollResults[i];
            if (result.status === 'fulfilled' && result.value) {
                item.poll[i] = result.value;
                item.poll_votes_count += result.value.points || 0;
            }
        }
    }

    async fetchPollOption(id: number): Promise<PollResult> {
        const url = `${HN_API_BASE_URL}/item/${id}`;
        const response = await axios.get<PollResult>(url, { timeout: 10000 });
        return response.data;
    }

    countComments(comments: Comment[]): number {
        if (!comments || comments.length === 0) return 0;

        let count = 0;
        for (const comment of comments) {
            if (!comment.deleted) {
                count++;
            }
            count += this.countComments(comment.comments);
        }
        return count;
    }

    flattenComments(comments: Comment[], maxDepth: number = -1): Comment[] {
        const flat: Comment[] = [];
        const traverse = (list: Comment[], depth: number) => {
            for (const comment of list) {
                flat.push(comment);
                if (maxDepth === -1 || depth < maxDepth) {
                    traverse(comment.comments || [], depth + 1);
                }
            }
        };
        traverse(comments || [], 0);
        return flat;
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
