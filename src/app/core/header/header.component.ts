import { Component, OnInit } from '@angular/core';

import { SettingsService } from '../../shared/services/settings.service';
import { SearchService } from '../../shared/services/search.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  settings: Settings;
  searchTerm: string = '';

  constructor(
    private _settingsService: SettingsService,
    private _searchService: SearchService
  ) {
    this.settings = this._settingsService.settings;
  }

  ngOnInit() {
  }

  toggleSettings() {
    this._settingsService.toggleSettings();
  }

  scrollTop() {
    window.scrollTo(0, 0);
  }

  onSearch() {
    this._searchService.setSearchTerm(this.searchTerm);
  }
}
