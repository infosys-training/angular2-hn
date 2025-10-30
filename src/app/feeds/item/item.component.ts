import { Component, Input, OnInit } from '@angular/core';
import { Story } from '../../shared/models/story';

import { SettingsService } from '../../shared/services/settings.service';
import { FavouritesService } from '../../shared/services/favourites.service';
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
    private _favouritesService: FavouritesService
  ) {
    this.settings = this._settingsService.settings;
  }

  ngOnInit() {}

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }

  isFavourite(): boolean {
    return this._favouritesService.isFavourite(this.item.id);
  }

  toggleFavourite(): void {
    this._favouritesService.toggleFavourite(this.item);
  }
}
