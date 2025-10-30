import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { FavoritesService } from '../../shared/services/favorites.service';
import { Story } from '../../shared/models/story';
import { FeedType } from '../../shared/models/feed-type.type';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;
  let favoritesService: FavoritesService;

  const mockStory: Story = {
    id: 123,
    title: 'Test Story',
    points: 100,
    user: 'testuser',
    time: Date.now(),
    time_ago: 1,
    type: 'news' as FeedType,
    url: 'https://example.com',
    domain: 'example.com',
    comments: [],
    comments_count: 5,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ItemComponent],
      providers: [SettingsService, FavoritesService]
    });

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    component.item = mockStory;
    favoritesService = TestBed.inject(FavoritesService);
    localStorage.clear();
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isFavorite', () => {
    it('should return false when item is not favorited', () => {
      expect(component.isFavorite()).toBe(false);
    });

    it('should return true when item is favorited', () => {
      favoritesService.addFavorite(mockStory.id);
      expect(component.isFavorite()).toBe(true);
    });
  });

  describe('toggleFavorite', () => {
    it('should add item to favorites when not favorited', () => {
      const event = new Event('click');
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopPropagation');

      component.toggleFavorite(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(favoritesService.isFavorite(mockStory.id)).toBe(true);
    });

    it('should remove item from favorites when already favorited', () => {
      favoritesService.addFavorite(mockStory.id);
      const event = new Event('click');

      component.toggleFavorite(event);

      expect(favoritesService.isFavorite(mockStory.id)).toBe(false);
    });
  });

  describe('hasUrl', () => {
    it('should return true for http urls', () => {
      component.item.url = 'https://example.com';
      expect(component.hasUrl).toBe(true);
    });

    it('should return false for non-http urls', () => {
      component.item.url = 'item/123';
      expect(component.hasUrl).toBe(false);
    });
  });
});
