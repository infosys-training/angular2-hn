import { TestBed } from '@angular/core/testing';
import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

describe('HackerNewsAPIService', () => {
    let service: HackerNewsAPIService;
    let mockFetch: jasmine.Spy;

    beforeEach(() => {
        mockFetch = jasmine.createSpy('fetch');
        (window as any).fetch = mockFetch;

        TestBed.configureTestingModule({
            providers: [HackerNewsAPIService]
        });
        service = TestBed.inject(HackerNewsAPIService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set baseUrl to Hacker News API endpoint', () => {
        expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
    });

    it('should fetch feed data', (done) => {
        const mockStories: Story[] = [
            { id: 1, title: 'Test Story', points: 100 } as Story,
            { id: 2, title: 'Another Story', points: 50 } as Story
        ];

        mockFetch.and.returnValue(Promise.resolve({
            json: () => Promise.resolve(mockStories)
        }));

        service.fetchFeed('news', 1).subscribe(stories => {
            expect(stories).toEqual(mockStories);
            expect(mockFetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=1', undefined);
            done();
        });
    });

    it('should fetch item content for regular story', (done) => {
        const mockStory: Story = {
            id: 123,
            title: 'Test Story',
            type: 'story',
            url: 'http://example.com',
            points: 100
        } as Story;

        mockFetch.and.returnValue(Promise.resolve({
            json: () => Promise.resolve(mockStory)
        }));

        service.fetchItemContent(123).subscribe(story => {
            expect(story).toEqual(mockStory);
            expect(mockFetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/123', undefined);
            done();
        });
    });

    it('should fetch item content for poll with poll options', (done) => {
        const mockPoll: Story = {
            id: 456,
            title: 'Poll Question',
            type: 'poll',
            poll: [null, null],
            poll_votes_count: 0
        } as any;

        const mockPollResult1: PollResult = { id: 457, points: 10 } as any;
        const mockPollResult2: PollResult = { id: 458, points: 20 } as any;

        let callCount = 0;
        mockFetch.and.callFake((url: string) => {
            if (url.includes('item/456')) {
                return Promise.resolve({
                    json: () => Promise.resolve(mockPoll)
                });
            } else if (url.includes('item/457')) {
                return Promise.resolve({
                    json: () => Promise.resolve(mockPollResult1)
                });
            } else if (url.includes('item/458')) {
                return Promise.resolve({
                    json: () => Promise.resolve(mockPollResult2)
                });
            }
        });

        service.fetchItemContent(456).subscribe(story => {
            expect(story.type).toBe('poll');
            expect(story.poll_votes_count).toBe(0);
            done();
        });
    });

    it('should fetch poll content', (done) => {
        const mockPollResult: PollResult = {
            id: 789,
            points: 25
        } as any;

        mockFetch.and.returnValue(Promise.resolve({
            json: () => Promise.resolve(mockPollResult)
        }));

        service.fetchPollContent(789).subscribe(pollResult => {
            expect(pollResult).toEqual(mockPollResult);
            expect(mockFetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/789', undefined);
            done();
        });
    });

    it('should fetch user data', (done) => {
        const mockUser: User = {
            id: 'testuser',
            karma: 1000,
            about: 'Test user bio'
        } as User;

        mockFetch.and.returnValue(Promise.resolve({
            json: () => Promise.resolve(mockUser)
        }));

        service.fetchUser('testuser').subscribe(user => {
            expect(user).toEqual(mockUser);
            expect(mockFetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/user/testuser', undefined);
            done();
        });
    });

    it('should handle fetch errors', (done) => {
        const errorMessage = 'Network error';
        mockFetch.and.returnValue(Promise.reject(errorMessage));

        service.fetchFeed('news', 1).subscribe(
            () => fail('should have failed'),
            (error) => {
                expect(error).toBe(errorMessage);
                done();
            }
        );
    });
});
