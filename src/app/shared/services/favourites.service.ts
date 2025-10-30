import { Injectable } from '@angular/core';
import { Story } from '../models/story';

@Injectable({
    providedIn: 'root',
})
export class FavouritesService {
    private favourites: Story[] = [];

    constructor() {
        this.loadFavourites();
    }

    private loadFavourites(): void {
        const stored = localStorage.getItem('favourites');
        if (stored) {
            try {
                this.favourites = JSON.parse(stored);
            } catch (e) {
                this.favourites = [];
            }
        }
    }

    private saveFavourites(): void {
        localStorage.setItem('favourites', JSON.stringify(this.favourites));
    }

    getFavourites(): Story[] {
        return this.favourites;
    }

    isFavourite(itemId: number): boolean {
        return this.favourites.some((fav) => fav.id === itemId);
    }

    toggleFavourite(item: Story): void {
        const index = this.favourites.findIndex((fav) => fav.id === item.id);
        if (index > -1) {
            this.favourites.splice(index, 1);
        } else {
            this.favourites.unshift(item);
        }
        this.saveFavourites();
    }

    removeFavourite(itemId: number): void {
        this.favourites = this.favourites.filter((fav) => fav.id !== itemId);
        this.saveFavourites();
    }

    clearAllFavourites(): void {
        this.favourites = [];
        this.saveFavourites();
    }
}
