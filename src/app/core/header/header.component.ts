import { Component, OnInit, inject } from '@angular/core';

import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent implements OnInit {
  private _settingsService = inject(SettingsService);

  settings: Settings;

  constructor() {
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
}
