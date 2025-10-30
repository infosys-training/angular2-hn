import { TestBed } from '@angular/core/testing';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  const STORAGE_KEY = 'hn_favorites';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoritesService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFavorites', () => {
    it('should return empty array when no favorites exist', () => {
      expect(service.getFavorites()).toEqual([]);
    });

    it('should return favorites from localStorage', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2, 3]));
      expect(service.getFavorites()).toEqual([1, 2, 3]);
    });
  });

  describe('isFavorite', () => {
    it('should return false when item is not a favorite', () => {
      expect(service.isFavorite(1)).toBe(false);
    });

    it('should return true when item is a favorite', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2, 3]));
      expect(service.isFavorite(2)).toBe(true);
    });
  });

  describe('addFavorite', () => {
    it('should add a favorite to empty list', () => {
      service.addFavorite(1);
      expect(service.getFavorites()).toEqual([1]);
    });

    it('should add a favorite to existing list', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2]));
      service.addFavorite(3);
      expect(service.getFavorites()).toEqual([1, 2, 3]);
    });

    it('should not add duplicate favorites', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2]));
      service.addFavorite(2);
      expect(service.getFavorites()).toEqual([1, 2]);
    });

    it('should persist to localStorage', () => {
      service.addFavorite(1);
      const item = localStorage.getItem(STORAGE_KEY);
      const stored = item ? JSON.parse(item) : null;
      expect(stored).toEqual([1]);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2, 3]));
      service.removeFavorite(2);
      expect(service.getFavorites()).toEqual([1, 3]);
    });

    it('should handle removing non-existent favorite', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2]));
      service.removeFavorite(3);
      expect(service.getFavorites()).toEqual([1, 2]);
    });

    it('should persist to localStorage', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2, 3]));
      service.removeFavorite(2);
      const item = localStorage.getItem(STORAGE_KEY);
      const stored = item ? JSON.parse(item) : null;
      expect(stored).toEqual([1, 3]);
    });
  });

  describe('toggleFavorite', () => {
    it('should add favorite when not already favorited', () => {
      service.toggleFavorite(1);
      expect(service.isFavorite(1)).toBe(true);
    });

    it('should remove favorite when already favorited', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([1]));
      service.toggleFavorite(1);
      expect(service.isFavorite(1)).toBe(false);
    });
  });
});
