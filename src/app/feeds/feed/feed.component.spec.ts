import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
    let component: FeedComponent;
    let fixture: ComponentFixture<FeedComponent>;
    let mockHackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;
    let mockActivatedRoute: any;

    beforeEach(async () => {
        mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);

        mockActivatedRoute = {
            data: of({ feedType: 'news' }),
            params: of({ page: '2' })
        };

        await TestBed.configureTestingModule({
            declarations: [FeedComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
                { provide: ActivatedRoute, useValue: mockActivatedRoute }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FeedComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should subscribe to route data and set feedType on ngOnInit', () => {
        const mockStories: Story[] = [
            { id: 1, title: 'Test Story' } as Story
        ];
        mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
        spyOn(window, 'scrollTo');

        component.ngOnInit();

        expect(component.feedType).toBe('news');
    });

    it('should subscribe to route params and fetch feed data on ngOnInit', () => {
        const mockStories: Story[] = [
            { id: 1, title: 'Test Story 1' } as Story,
            { id: 2, title: 'Test Story 2' } as Story
        ];
        mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
        spyOn(window, 'scrollTo');

        component.ngOnInit();

        expect(component.pageNum).toBe(2);
        expect(mockHackerNewsAPIService.fetchFeed).toHaveBeenCalledWith('news', 2);
        expect(component.items).toEqual(mockStories);
    });

    it('should default to page 1 if no page param is provided', () => {
        mockActivatedRoute.params = of({});
        const mockStories: Story[] = [{ id: 1, title: 'Test' } as Story];
        mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
        spyOn(window, 'scrollTo');

        component.ngOnInit();

        expect(component.pageNum).toBe(1);
        expect(mockHackerNewsAPIService.fetchFeed).toHaveBeenCalledWith('news', 1);
    });

    it('should calculate listStart correctly based on page number', () => {
        const mockStories: Story[] = [{ id: 1, title: 'Test' } as Story];
        mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
        spyOn(window, 'scrollTo');

        component.ngOnInit();

        expect(component.listStart).toBe(31);
    });

    it('should scroll to top after loading items', () => {
        const mockStories: Story[] = [{ id: 1, title: 'Test' } as Story];
        mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
        spyOn(window, 'scrollTo');

        component.ngOnInit();

        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should set error message on API failure', () => {
        mockHackerNewsAPIService.fetchFeed.and.returnValue(throwError('Network error'));
        spyOn(window, 'scrollTo');

        component.ngOnInit();

        expect(component.errorMessage).toBe('Could not load news stories.');
    });
});
