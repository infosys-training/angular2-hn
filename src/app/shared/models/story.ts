import { Comment } from './comment';
import { FeedType } from './feed-type.type';
import { PollResult } from './poll-result';

// tslint:disable:variable-name
export class Story {
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    time_ago: string;
    type: FeedType;
    url: string;
    domain: string;
    comments: Comment[];
    comments_count: number;
    poll: PollResult[];
    poll_votes_count: number;
    deleted: boolean;
    dead: boolean;
}
// tslint:enable:variable-name
