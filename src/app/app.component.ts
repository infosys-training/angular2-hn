import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { SettingsService } from './shared/services/settings.service';
import { Settings } from './shared/models/settings';

declare let ga: (command: string, ...args: string[]) => void;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  settings: Settings;
  theme: string;

  constructor(
    private settingsService: SettingsService,
    public router: Router
  ) {
    this.settings = this.settingsService.settings;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (typeof ga === 'function') {
          ga('set', 'page', event.urlAfterRedirects);
          ga('send', 'pageview');
        }
      }
    });
  }
}
