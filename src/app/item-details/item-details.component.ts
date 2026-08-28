import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLinkActive, RouterLink } from '@angular/router';
import { Location, NgIf, NgFor, NgStyle } from '@angular/common';
import { Subscription } from 'rxjs';

import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';

import { Story } from '../shared/models/story';
import { Settings } from '../shared/models/settings';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { CommentComponent } from './comment/comment.component';
import { CommentPipe } from '../shared/pipes/comment.pipe';

@Component({
    selector: 'app-item-details',
    templateUrl: './item-details.component.html',
    styleUrls: ['./item-details.component.scss'],
    imports: [NgIf, LoaderComponent, ErrorMessageComponent, RouterLinkActive, RouterLink, NgFor, NgStyle, CommentComponent, CommentPipe]
})
export class ItemDetailsComponent implements OnInit {
  sub: Subscription;
  item: Story;
  errorMessage = '';
  settings: Settings;

  constructor(
    private _hackerNewsAPIService: HackerNewsAPIService,
    private _settingsService: SettingsService,
    private route: ActivatedRoute,
    private _location: Location
  ) {
    this.settings = this._settingsService.settings;
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      let itemID = +params['id'];
      this._hackerNewsAPIService.fetchItemContent(itemID).subscribe(item => {
        this.item = item;
      }, error => this.errorMessage = 'Could not load item comments.');
    });
    window.scrollTo(0, 0);
  }

  goBack() {
    this._location.back();
  }

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }

}
