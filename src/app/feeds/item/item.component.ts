import { Component, Input, OnInit } from '@angular/core';
import { Story } from '../../shared/models/story';

import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { FavoritesService } from '../../shared/services/favorites.service';

@Component({
  selector: 'item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() item: Story;
  settings: Settings;
  isFavorite = false;

  constructor(
    private _settingsService: SettingsService,
    private _favoritesService: FavoritesService
  ) {
    this.settings = this._settingsService.settings;
  }

  ngOnInit() {
    this.isFavorite = this._favoritesService.isFavorite(this.item.id);
    this._favoritesService.favorites$.subscribe(() => {
      this.isFavorite = this._favoritesService.isFavorite(this.item.id);
    });
  }

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this._favoritesService.toggleFavorite(this.item.id);
  }

}
