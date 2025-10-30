import { Component, Input, OnInit } from '@angular/core';
import { Story } from '../../shared/models/story';

import { SettingsService } from '../../shared/services/settings.service';
import { FavoritesService } from '../../shared/services/favorites.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() item: Story;
  settings: Settings;

  constructor(
    private _settingsService: SettingsService,
    private _favoritesService: FavoritesService
  ) {
    this.settings = this._settingsService.settings;
  }

  ngOnInit() {}

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }

  isFavorite(): boolean {
    return this._favoritesService.isFavorite(this.item.id);
  }

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this._favoritesService.toggleFavorite(this.item.id);
  }

}
