export type FeedType = 'news' | 'newest' | 'show' | 'ask' | 'jobs';

export interface IFeedRequest {
    feedType: FeedType;
    page: number;
}

export interface IFeedResponse {
    items: IFeedItem[];
    feedType: FeedType;
    page: number;
    hasMore: boolean;
    cachedAt?: string;
}

export interface IFeedItem {
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
