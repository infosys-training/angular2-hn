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
    private settingsService: SettingsService,
    private searchService: SearchService
  ) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit() {
  }

  toggleSettings() {
    this.settingsService.toggleSettings();
  }

  scrollTop() {
    window.scrollTo(0, 0);
  }

  onSearch() {
    this.searchService.setSearchTerm(this.searchText);
  }

  onClearSearch() {
    this.searchText = '';
    this.searchService.clearSearch();
  }
}
