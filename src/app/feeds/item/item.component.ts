import { Component, Input, inject } from '@angular/core';
import { Story } from '../../shared/models/story';

import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { NgStyle } from '@angular/common';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { CommentPipe } from '../../shared/pipes/comment.pipe';

@Component({
    selector: 'app-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss'],
    imports: [NgStyle, RouterLinkActive, RouterLink, CommentPipe]
})
export class ItemComponent {
  private _settingsService = inject(SettingsService);

  @Input() item: Story;
  settings: Settings;

  constructor() {
    this.settings = this._settingsService.settings;
  }

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }

}
