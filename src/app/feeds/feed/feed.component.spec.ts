import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { FavoritesService } from '../../shared/services/favorites.service';
import { Story } from '../../shared/models/story';
import { FeedType } from '../../shared/models/feed-type.type';

describe('FeedComponent - Favorites', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;
  let hackerNewsService: jasmine.SpyObj<HackerNewsAPIService>;
  let favoritesService: jasmine.SpyObj<FavoritesService>;
  let activatedRoute: any;

  const mockStories: Story[] = [
    {
      id: 1,
      title: 'Story 1',
      points: 100,
      user: 'user1',
      time: Date.now(),
      time_ago: 1,
      type: 'news' as FeedType,
      url: 'https://example.com/1',
      domain: 'example.com',
      comments: [],
      comments_count: 5,
      poll: [],
      poll_votes_count: 0,
      deleted: false,
      dead: false
    },
    {
      id: 2,
      title: 'Story 2',
      points: 200,
      user: 'user2',
      time: Date.now(),
      time_ago: 2,
      type: 'news' as FeedType,
      url: 'https://example.com/2',
      domain: 'example.com',
      comments: [],
      comments_count: 10,
      poll: [],
      poll_votes_count: 0,
      deleted: false,
      dead: false
    }
  ];

  beforeEach(() => {
    hackerNewsService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed', 'fetchItemContent']);
    favoritesService = jasmine.createSpyObj('FavoritesService', ['getFavorites']);

    activatedRoute = {
      data: of({ feedType: 'favorites' }),
      params: of({ page: '1' })
    };

    TestBed.configureTestingModule({
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: hackerNewsService },
        { provide: FavoritesService, useValue: favoritesService },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    });

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load favorites when feedType is favorites', () => {
    favoritesService.getFavorites.and.returnValue([1, 2]);
    hackerNewsService.fetchItemContent.and.returnValues(
      of(mockStories[0]),
      of(mockStories[1])
    );

    fixture.detectChanges();

    expect(favoritesService.getFavorites).toHaveBeenCalled();
    expect(hackerNewsService.fetchItemContent).toHaveBeenCalledWith(1);
    expect(hackerNewsService.fetchItemContent).toHaveBeenCalledWith(2);
    expect(component.items.length).toBe(2);
  });

  it('should handle empty favorites list', () => {
    favoritesService.getFavorites.and.returnValue([]);

    fixture.detectChanges();

    expect(component.items).toEqual([]);
    expect(hackerNewsService.fetchItemContent).not.toHaveBeenCalled();
  });

  it('should handle pagination for favorites', () => {
    const favoriteIds = Array.from({ length: 40 }, (_, i) => i + 1);
    favoritesService.getFavorites.and.returnValue(favoriteIds);

    activatedRoute.params = of({ page: '2' });

    hackerNewsService.fetchItemContent.and.returnValue(of(mockStories[0]));

    fixture.detectChanges();

    expect(hackerNewsService.fetchItemContent).toHaveBeenCalledTimes(10);
    const firstCall = hackerNewsService.fetchItemContent.calls.argsFor(0)[0];
    expect(firstCall).toBe(31);
  });

  it('should handle error loading favorites', () => {
    favoritesService.getFavorites.and.returnValue([1]);
    hackerNewsService.fetchItemContent.and.returnValue(throwError('Error'));

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Could not load favorite stories.');
  });
});
