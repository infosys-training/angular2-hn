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
  searchText = '';

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

  onSearch() {
    this._searchService.setSearchTerm(this.searchText.trim());
  }

  scrollTop() {
    this._searchService.clearSearch();
    this.searchText = '';
    window.scrollTo(0, 0);
  }
}
