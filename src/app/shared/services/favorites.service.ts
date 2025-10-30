import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'hn_favorites';

  constructor() {}

  getFavorites(): number[] {
    const favorites = localStorage.getItem(this.STORAGE_KEY);
    return favorites ? JSON.parse(favorites) : [];
  }

  isFavorite(id: number): boolean {
    return this.getFavorites().includes(id);
  }

  addFavorite(id: number): void {
    const favorites = this.getFavorites();
    if (!favorites.includes(id)) {
      favorites.push(id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
    }
  }

  removeFavorite(id: number): void {
    const favorites = this.getFavorites().filter(fav => fav !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
  }

  toggleFavorite(id: number): void {
    if (this.isFavorite(id)) {
      this.removeFavorite(id);
    } else {
      this.addFavorite(id);
    }
  }
}
