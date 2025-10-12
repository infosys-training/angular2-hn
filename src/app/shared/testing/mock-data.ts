import { Story } from '../models/story';
import { User } from '../models/user';
import { Comment } from '../models/comment';
import { PollResult } from '../models/poll-result';

export class MockDataFactory {
    static createMockStory(overrides?: Partial<Story>): Story {
        return {
            id: 1,
            title: 'Mock Story Title',
            points: 100,
            user: 'mockuser',
            time: Date.now(),
            time_ago: 1,
            type: 'story',
            url: 'http://example.com',
            domain: 'example.com',
            comments: [],
            comments_count: 0,
            poll: [],
            poll_votes_count: 0,
            deleted: false,
            dead: false,
            ...overrides
        } as Story;
    }

    static createMockUser(overrides?: Partial<User>): User {
        return {
            id: 'mockuser',
            crated_time: Date.now(),
            created: '1 year ago',
            karma: 1000,
            avg: 5.5,
            about: 'Mock user bio',
            ...overrides
        } as User;
    }

    static createMockComment(overrides?: Partial<Comment>): Comment {
        return {
            id: 1,
            level: 0,
            user: 'mockuser',
            time: Date.now(),
            time_ago: '1 hour ago',
            content: 'Mock comment content',
            deleted: false,
            comments: [],
            ...overrides
        };
    }

    static createMockPollResult(overrides?: Partial<PollResult>): PollResult {
        return {
            id: 1,
            points: 50,
            ...overrides
        } as PollResult;
    }

    static createMockStories(count: number): Story[] {
        return Array.from({ length: count }, (_, i) =>
            MockDataFactory.createMockStory({ id: i + 1, title: `Story ${i + 1}` })
        );
    }
}
