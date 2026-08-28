import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';

import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';
import { SettingsService } from './shared/services/settings.service';
import { Settings } from './shared/models/settings';

declare let ga: Function;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [HeaderComponent, RouterOutlet, FooterComponent]
})

export class AppComponent {
  settings: Settings;
  theme: string;

  constructor(
    private _settingsService: SettingsService,
    public router: Router
  ) {
    this.settings = this._settingsService.settings;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        ga('set', 'page', event.urlAfterRedirects);
        ga('send', 'pageview');
      }
    });
  }
}
