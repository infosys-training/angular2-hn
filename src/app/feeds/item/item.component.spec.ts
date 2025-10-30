import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { FavouritesService } from '../../shared/services/favourites.service';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
    let component: ItemComponent;
    let fixture: ComponentFixture<ItemComponent>;
    let favouritesService: FavouritesService;
    let mockStory: Story;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ItemComponent],
            providers: [SettingsService, FavouritesService],
        }).compileComponents();
    });

    beforeEach(() => {
        localStorage.clear();
        fixture = TestBed.createComponent(ItemComponent);
        component = fixture.componentInstance;
        favouritesService = TestBed.inject(FavouritesService);

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

        component.item = mockStory;
        fixture.detectChanges();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should check if item is favourite', () => {
        expect(component.isFavourite()).toBe(false);

        favouritesService.toggleFavourite(mockStory);

        expect(component.isFavourite()).toBe(true);
    });

    it('should toggle favourite status', () => {
        expect(component.isFavourite()).toBe(false);

        component.toggleFavourite();

        expect(component.isFavourite()).toBe(true);
        expect(favouritesService.isFavourite(1)).toBe(true);

        component.toggleFavourite();

        expect(component.isFavourite()).toBe(false);
        expect(favouritesService.isFavourite(1)).toBe(false);
    });

    it('should detect URLs correctly', () => {
        component.item.url = 'https://example.com';
        expect(component.hasUrl).toBe(true);

        component.item.url = 'http://example.com';
        expect(component.hasUrl).toBe(true);

        component.item.url = 'item?id=123';
        expect(component.hasUrl).toBe(false);
    });
});
