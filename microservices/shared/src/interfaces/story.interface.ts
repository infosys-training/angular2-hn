export interface IStory {
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    time_ago: string;
    type: 'poll' | 'story' | 'job';
    url: string;
    domain: string;
    comments: IComment[];
    comments_count: number;
    poll: IPollResult[];
    poll_votes_count: number;
    deleted: boolean;
    dead: boolean;
}

export interface IComment {
    id: number;
    level: number;
    user: string;
    time: number;
    time_ago: string;
    content: string;
    deleted: boolean;
    comments: IComment[];
}

export interface IPollResult {
    points: number;
    content: string;
}
