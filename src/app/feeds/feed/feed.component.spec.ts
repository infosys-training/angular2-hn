import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { FavoritesService } from '../../shared/services/favorites.service';
import { Story } from '../../shared/models/story';
import { of, throwError } from 'rxjs';

describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;
  let hackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;
  let favoritesService: jasmine.SpyObj<FavoritesService>;
  let activatedRoute: any;

  const mockStories: Story[] = [
    {
      id: 123,
      title: 'Test Story 1',
      points: 100,
      user: 'user1',
      time: 1234567890,
      time_ago: 1,
      type: 'story',
      url: 'https://example1.com',
      domain: 'example1.com',
      comments: [],
      comments_count: 5,
      poll: [],
      poll_votes_count: 0,
      deleted: false,
      dead: false
    },
    {
      id: 456,
      title: 'Test Story 2',
      points: 200,
      user: 'user2',
      time: 1234567891,
      time_ago: 2,
      type: 'story',
      url: 'https://example2.com',
      domain: 'example2.com',
      comments: [],
      comments_count: 10,
      poll: [],
      poll_votes_count: 0,
      deleted: false,
      dead: false
    }
  ];

  beforeEach(() => {
    const hackerNewsAPIServiceSpy = jasmine.createSpyObj('HackerNewsAPIService',
      ['fetchFeed', 'fetchItemContent']
    );
    const favoritesServiceSpy = jasmine.createSpyObj('FavoritesService',
      ['getFavorites']
    );

    activatedRoute = {
      data: of({ feedType: 'news' }),
      params: of({ page: '1' })
    };

    TestBed.configureTestingModule({
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: hackerNewsAPIServiceSpy },
        { provide: FavoritesService, useValue: favoritesServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    });

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
    hackerNewsAPIService = TestBed.inject(HackerNewsAPIService) as jasmine.SpyObj<HackerNewsAPIService>;
    favoritesService = TestBed.inject(FavoritesService) as jasmine.SpyObj<FavoritesService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit with regular feed', () => {
    it('should fetch feed from API for non-favorites feed', () => {
      hackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));

      component.ngOnInit();

      expect(hackerNewsAPIService.fetchFeed).toHaveBeenCalledWith('news', 1);
      expect(component.items).toEqual(mockStories);
    });

    it('should set listStart based on page number', () => {
      hackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
      activatedRoute.params = of({ page: '3' });

      component.ngOnInit();

      expect(component.listStart).toBe(61);
    });

    it('should handle API errors gracefully', () => {
      hackerNewsAPIService.fetchFeed.and.returnValue(
        throwError(new Error('API Error'))
      );

      component.ngOnInit();

      expect(component.errorMessage).toBe('Could not load news stories.');
    });
  });

  describe('loadFavorites', () => {
    beforeEach(() => {
      activatedRoute.data = of({ feedType: 'favorites' });
      activatedRoute.params = of({ page: '1' });
    });

    it('should load favorites from FavoritesService', () => {
      favoritesService.getFavorites.and.returnValue([123, 456]);
      hackerNewsAPIService.fetchItemContent.and.returnValues(
        of(mockStories[0]),
        of(mockStories[1])
      );

      component.ngOnInit();

      expect(favoritesService.getFavorites).toHaveBeenCalled();
      expect(hackerNewsAPIService.fetchItemContent).toHaveBeenCalledWith(123);
      expect(hackerNewsAPIService.fetchItemContent).toHaveBeenCalledWith(456);
    });

    it('should handle empty favorites list', () => {
      favoritesService.getFavorites.and.returnValue([]);

      component.ngOnInit();

      expect(component.items).toEqual([]);
      expect(component.listStart).toBe(0);
    });

    it('should handle pagination correctly', () => {
      const favoriteIds = Array.from({ length: 50 }, (_, i) => i + 1);
      favoritesService.getFavorites.and.returnValue(favoriteIds);
      activatedRoute.params = of({ page: '2' });

      hackerNewsAPIService.fetchItemContent.and.returnValue(of(mockStories[0]));

      component.ngOnInit();

      expect(hackerNewsAPIService.fetchItemContent).toHaveBeenCalledTimes(20);
      expect(component.listStart).toBe(31);
    });

    it('should handle empty page when favorites exist but page is beyond range', () => {
      favoritesService.getFavorites.and.returnValue([123, 456]);
      activatedRoute.params = of({ page: '10' });

      component.ngOnInit();

      expect(component.items).toEqual([]);
      expect(component.listStart).toBe(0);
    });

    it('should handle fetchItemContent errors', () => {
      favoritesService.getFavorites.and.returnValue([123]);
      hackerNewsAPIService.fetchItemContent.and.returnValue(
        throwError(new Error('API Error'))
      );

      component.ngOnInit();

      expect(component.errorMessage).toBe('Could not load favorites.');
    });
  });
});
