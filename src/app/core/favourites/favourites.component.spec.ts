import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavouritesComponent } from './favourites.component';
import { FavouritesService } from '../../shared/services/favourites.service';
import { Story } from '../../shared/models/story';

describe('FavouritesComponent', () => {
    let component: FavouritesComponent;
    let fixture: ComponentFixture<FavouritesComponent>;
    let favouritesService: FavouritesService;
    let mockStory: Story;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FavouritesComponent],
            providers: [FavouritesService],
        }).compileComponents();
    });

    beforeEach(() => {
        localStorage.clear();
        fixture = TestBed.createComponent(FavouritesComponent);
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
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load favourites on init', () => {
        favouritesService.toggleFavourite(mockStory);

        component.ngOnInit();

        expect(component.favourites.length).toBe(1);
        expect(component.favourites[0].id).toBe(1);
    });

    it('should display empty favourites list', () => {
        component.ngOnInit();

        expect(component.favourites.length).toBe(0);
    });

    it('should clear all favourites with confirmation', () => {
        spyOn(window, 'confirm').and.returnValue(true);

        favouritesService.toggleFavourite(mockStory);
        component.ngOnInit();

        expect(component.favourites.length).toBe(1);

        component.clearAll();

        expect(component.favourites.length).toBe(0);
        expect(favouritesService.getFavourites().length).toBe(0);
    });

    it('should not clear favourites if user cancels', () => {
        spyOn(window, 'confirm').and.returnValue(false);

        favouritesService.toggleFavourite(mockStory);
        component.ngOnInit();

        expect(component.favourites.length).toBe(1);

        component.clearAll();

        expect(component.favourites.length).toBe(1);
        expect(favouritesService.getFavourites().length).toBe(1);
    });
});
