import { TestBed } from '@angular/core/testing';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let store: { [key: string]: string } = {};

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoritesService);

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return store[key] || null;
    });
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    spyOn(localStorage, 'clear').and.callFake(() => {
      store = {};
    });
  });

  afterEach(() => {
    store = {};
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isFavorite', () => {
    it('should return false for non-favorited item', () => {
      expect(service.isFavorite(123)).toBe(false);
    });

    it('should return true for favorited item', () => {
      service.toggleFavorite(123);
      expect(service.isFavorite(123)).toBe(true);
    });
  });

  describe('toggleFavorite', () => {
    it('should add item to favorites when not already favorited', () => {
      service.toggleFavorite(123);
      expect(service.isFavorite(123)).toBe(true);
      expect(service.getFavorites()).toContain(123);
    });

    it('should remove item from favorites when already favorited', () => {
      service.toggleFavorite(123);
      expect(service.isFavorite(123)).toBe(true);

      service.toggleFavorite(123);
      expect(service.isFavorite(123)).toBe(false);
      expect(service.getFavorites()).not.toContain(123);
    });

    it('should persist favorites to localStorage', () => {
      service.toggleFavorite(123);
      expect(localStorage.setItem).toHaveBeenCalledWith('favorites', JSON.stringify([123]));
    });

    it('should emit favorites$ observable when toggling', (done) => {
      service.favorites$.subscribe((favorites) => {
        if (favorites.length > 0) {
          expect(favorites).toContain(456);
          done();
        }
      });
      service.toggleFavorite(456);
    });
  });

  describe('getFavorites', () => {
    it('should return empty array when no favorites', () => {
      expect(service.getFavorites()).toEqual([]);
    });

    it('should return all favorited items', () => {
      service.toggleFavorite(123);
      service.toggleFavorite(456);
      service.toggleFavorite(789);

      const favorites = service.getFavorites();
      expect(favorites.length).toBe(3);
      expect(favorites).toContain(123);
      expect(favorites).toContain(456);
      expect(favorites).toContain(789);
    });
  });

  describe('clearFavorites', () => {
    it('should remove all favorites', () => {
      service.toggleFavorite(123);
      service.toggleFavorite(456);
      expect(service.getFavorites().length).toBe(2);

      service.clearFavorites();
      expect(service.getFavorites().length).toBe(0);
    });

    it('should persist cleared favorites to localStorage', () => {
      service.toggleFavorite(123);
      service.clearFavorites();
      expect(localStorage.setItem).toHaveBeenCalledWith('favorites', JSON.stringify([]));
    });
  });

  describe('localStorage persistence', () => {
    it('should load favorites from localStorage on initialization', () => {
      store.favorites = JSON.stringify([111, 222, 333]);

      const newService = new FavoritesService();
      expect(newService.getFavorites()).toEqual([111, 222, 333]);
    });

    it('should handle invalid localStorage data gracefully', () => {
      store.favorites = 'invalid json';

      expect(() => {
        const newService = new FavoritesService();
      }).not.toThrow();
    });
  });
});
