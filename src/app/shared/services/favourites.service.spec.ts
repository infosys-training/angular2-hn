import { TestBed } from '@angular/core/testing';
import { FavouritesService } from './favourites.service';
import { Story } from '../models/story';

describe('FavouritesService', () => {
    let service: FavouritesService;
    let mockStory: Story;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({});
        service = TestBed.inject(FavouritesService);

        mockStory = {
            id: 1,
            title: 'Test Story',
            points: 100,
            user: 'testuser',
            time: 1234567890,
            time_ago: 1234567890,
            type: 'news',
            url: 'https://example.com',
            domain: 'example.com',
            comments: [],
            comments_count: 5,
            poll: [],
            poll_votes_count: 0,
            deleted: false,
            dead: false,
        } as unknown as Story;
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize with empty favourites', () => {
        expect(service.getFavourites()).toEqual([]);
    });

    it('should add item to favourites', () => {
        service.toggleFavourite(mockStory);
        expect(service.getFavourites().length).toBe(1);
        expect(service.isFavourite(1)).toBe(true);
    });

    it('should remove item from favourites', () => {
        service.toggleFavourite(mockStory);
        expect(service.isFavourite(1)).toBe(true);

        service.toggleFavourite(mockStory);
        expect(service.isFavourite(1)).toBe(false);
        expect(service.getFavourites().length).toBe(0);
    });

    it('should persist favourites to localStorage', () => {
        service.toggleFavourite(mockStory);

        const stored = localStorage.getItem('favourites');
        expect(stored).toBeTruthy();

        if (stored) {
            const parsed = JSON.parse(stored);
            expect(parsed.length).toBe(1);
            expect(parsed[0].id).toBe(1);
        }
    });

    it('should load favourites from localStorage on init', () => {
        const testData = [mockStory];
        localStorage.setItem('favourites', JSON.stringify(testData));

        const newService = new FavouritesService();
        expect(newService.getFavourites().length).toBe(1);
        expect(newService.isFavourite(1)).toBe(true);
    });

    it('should handle corrupted localStorage data', () => {
        localStorage.setItem('favourites', 'invalid json');

        const newService = new FavouritesService();
        expect(newService.getFavourites()).toEqual([]);
    });

    it('should remove favourite by id', () => {
        service.toggleFavourite(mockStory);
        service.removeFavourite(1);

        expect(service.isFavourite(1)).toBe(false);
        expect(service.getFavourites().length).toBe(0);
    });

    it('should clear all favourites', () => {
        service.toggleFavourite(mockStory);
        service.toggleFavourite({ ...mockStory, id: 2 });

        expect(service.getFavourites().length).toBe(2);

        service.clearAllFavourites();

        expect(service.getFavourites().length).toBe(0);
        expect(localStorage.getItem('favourites')).toBe('[]');
    });

    it('should add new items to the beginning of the list', () => {
        const story1 = { ...mockStory, id: 1, title: 'Story 1' };
        const story2 = { ...mockStory, id: 2, title: 'Story 2' };

        service.toggleFavourite(story1);
        service.toggleFavourite(story2);

        const favourites = service.getFavourites();
        expect(favourites[0].id).toBe(2);
        expect(favourites[1].id).toBe(1);
    });
});
