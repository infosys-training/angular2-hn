import { Component, OnInit } from '@angular/core';

import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settings: Settings;

  constructor(private settingsService: SettingsService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit() {
  }

  closeSettings() {
    this.settingsService.toggleSettings();
  }

  toggleOpenLinksInNewTab() {
    this.settingsService.toggleOpenLinksInNewTab();
  }

  selectTheme(theme) {
    this.settingsService.setTheme(theme);
  }

  changeTitleFont(val) {
    this.settingsService.setFont(val);
  }

  changeSpacing(val) {
    this.settingsService.setSpacing(val);
  }
}
