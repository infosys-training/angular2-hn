import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private favoritesKey = 'favorites';
  private favoritesSubject: BehaviorSubject<number[]>;
  public favorites$: Observable<number[]>;

  constructor() {
    const storedFavorites = this.getFavoritesFromStorage();
    this.favoritesSubject = new BehaviorSubject<number[]>(storedFavorites);
    this.favorites$ = this.favoritesSubject.asObservable();
  }

  private getFavoritesFromStorage(): number[] {
    const stored = localStorage.getItem(this.favoritesKey);
    return stored ? JSON.parse(stored) : [];
  }

  private saveFavoritesToStorage(favorites: number[]): void {
    localStorage.setItem(this.favoritesKey, JSON.stringify(favorites));
  }

  isFavorite(itemId: number): boolean {
    return this.favoritesSubject.value.includes(itemId);
  }

  toggleFavorite(itemId: number): void {
    const currentFavorites = this.favoritesSubject.value;
    let updatedFavorites: number[];

    if (currentFavorites.includes(itemId)) {
      updatedFavorites = currentFavorites.filter(id => id !== itemId);
    } else {
      updatedFavorites = [...currentFavorites, itemId];
    }

    this.saveFavoritesToStorage(updatedFavorites);
    this.favoritesSubject.next(updatedFavorites);
  }

  getFavorites(): number[] {
    return this.favoritesSubject.value;
  }

  clearFavorites(): void {
    this.saveFavoritesToStorage([]);
    this.favoritesSubject.next([]);
  }
}
