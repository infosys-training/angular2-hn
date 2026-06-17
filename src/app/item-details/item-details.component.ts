import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';

import { Story } from '../shared/models/story';
import { Settings } from '../shared/models/settings';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss']
})
export class ItemDetailsComponent implements OnInit, OnDestroy {
  sub: Subscription;
  item: Story;
  errorMessage = '';
  settings: Settings;

  constructor(
    private hackerNewsAPIService: HackerNewsAPIService,
    private settingsService: SettingsService,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      const itemID = +params.id;
      this.hackerNewsAPIService.fetchItemContent(itemID).subscribe(item => {
        this.item = item;
      }, error => this.errorMessage = 'Could not load item comments.');
    });
    window.scrollTo(0, 0);
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  goBack() {
    this.location.back();
  }

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }

}
