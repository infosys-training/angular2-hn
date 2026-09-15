import { Component, inject } from '@angular/core';

import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { SettingsComponent } from '../settings/settings.component';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [RouterLink, RouterLinkActive, SettingsComponent]
})
export class HeaderComponent {
  private _settingsService = inject(SettingsService);

  settings: Settings;

  constructor() {
    this.settings = this._settingsService.settings;
  }

  toggleSettings() {
    this._settingsService.toggleSettings();
  }

  scrollTop() {
    window.scrollTo(0, 0);
  }
}
