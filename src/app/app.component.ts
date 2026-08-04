import { Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { SettingsService } from './shared/services/settings.service';
import { Settings } from './shared/models/settings';

declare let ga: (...args: unknown[]) => void;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})

export class AppComponent {
  private _settingsService = inject(SettingsService);
  router = inject(Router);

  settings: Settings;
  theme: string;

  constructor() {
    this.settings = this._settingsService.settings;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        ga('set', 'page', event.urlAfterRedirects);
        ga('send', 'pageview');
      }
    });
  }
}
