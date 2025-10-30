import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { FavoritesService } from '../../shared/services/favorites.service';
import { Story } from '../../shared/models/story';
import { of } from 'rxjs';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;
  let favoritesService: jasmine.SpyObj<FavoritesService>;
  let settingsService: jasmine.SpyObj<SettingsService>;

  const mockStory: Story = {
    id: 123,
    title: 'Test Story',
    points: 100,
    user: 'testuser',
    time: 1234567890,
    time_ago: 2,
    type: 'story',
    url: 'https://example.com',
    domain: 'example.com',
    comments: [],
    comments_count: 10,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false
  };

  beforeEach(() => {
    const favoritesServiceSpy = jasmine.createSpyObj('FavoritesService',
      ['isFavorite', 'toggleFavorite', 'getFavorites']
    );
    favoritesServiceSpy.favorites$ = of([]);

    const settingsServiceSpy = jasmine.createSpyObj('SettingsService', []);
    settingsServiceSpy.settings = { theme: 'default', listType: 'compact' };

    TestBed.configureTestingModule({
      declarations: [ItemComponent],
      providers: [
        { provide: FavoritesService, useValue: favoritesServiceSpy },
        { provide: SettingsService, useValue: settingsServiceSpy }
      ]
    });

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    component.item = mockStory;
    favoritesService = TestBed.inject(FavoritesService) as jasmine.SpyObj<FavoritesService>;
    settingsService = TestBed.inject(SettingsService) as jasmine.SpyObj<SettingsService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set isFavorite based on FavoritesService', () => {
      favoritesService.isFavorite.and.returnValue(true);

      component.ngOnInit();

      expect(favoritesService.isFavorite).toHaveBeenCalledWith(123);
      expect(component.isFavorite).toBe(true);
    });

    it('should subscribe to favorites$ observable', () => {
      favoritesService.isFavorite.and.returnValue(false);

      component.ngOnInit();

      expect(component.isFavorite).toBe(false);
    });
  });

  describe('toggleFavorite', () => {
    it('should call FavoritesService.toggleFavorite with item id', () => {
      const event = new Event('click');

      component.toggleFavorite(event);

      expect(favoritesService.toggleFavorite).toHaveBeenCalledWith(123);
    });

    it('should prevent event default behavior', () => {
      const event = new Event('click');
      spyOn(event, 'preventDefault');

      component.toggleFavorite(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should stop event propagation', () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.toggleFavorite(event);

      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('hasUrl', () => {
    it('should return true for items with http URL', () => {
      component.item = { ...mockStory, url: 'https://example.com' };
      expect(component.hasUrl).toBe(true);
    });

    it('should return false for items without http URL', () => {
      component.item = { ...mockStory, url: 'item?id=123' };
      expect(component.hasUrl).toBe(false);
    });
  });
});
