import { Component, OnInit } from '@angular/core';
import { FavouritesService } from '../../shared/services/favourites.service';
import { Story } from '../../shared/models/story';

@Component({
    selector: 'app-favourites',
    templateUrl: './favourites.component.html',
    styleUrls: ['./favourites.component.scss'],
})
export class FavouritesComponent implements OnInit {
    favourites: Story[] = [];

    constructor(private _favouritesService: FavouritesService) {}

    ngOnInit() {
        this.favourites = this._favouritesService.getFavourites();
    }

    clearAll() {
        if (confirm('Are you sure you want to clear all favourites?')) {
            this._favouritesService.clearAllFavourites();
            this.favourites = [];
        }
    }
}
