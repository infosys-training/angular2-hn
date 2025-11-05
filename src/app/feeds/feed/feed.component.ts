import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { SettingsService } from '../../shared/services/settings.service';
import { Story } from '../../shared/models/story';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})

export class FeedComponent implements OnInit, OnDestroy {
  typeSub: Subscription;
  pageSub: Subscription;
  searchSub: Subscription;
  items: Story[];
  filteredItems: Story[];
  feedType: string;
  pageNum: number;
  listStart: number;
  errorMessage = '';

  constructor(
    private _hackerNewsAPIService: HackerNewsAPIService,
    private route: ActivatedRoute,
    private _settingsService: SettingsService
  ) { }

  ngOnInit() {
    this.typeSub = this.route
      .data
      .subscribe(data => {
        this.feedType = (data as any).feedType;
      });

    this.pageSub = this.route.params.subscribe(params => {
      this.pageNum = params['page'] ? +params['page'] : 1;
      this._hackerNewsAPIService.fetchFeed(this.feedType, this.pageNum)
        .subscribe(
          items => {
            this.items = items;
            this.filteredItems = items;
          },
          error => this.errorMessage = 'Could not load ' + this.feedType + ' stories.',
          () => {
            this.listStart = ((this.pageNum - 1) * 30) + 1;
            window.scrollTo(0, 0);
          }
        );
    });

    this.searchSub = this._settingsService.searchText$.subscribe(searchText => {
      if (this.items) {
        if (searchText.trim() === '') {
          this.filteredItems = this.items;
        } else {
          this.filteredItems = this.items.filter(item => 
            item.title.toLowerCase().includes(searchText.toLowerCase())
          );
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.typeSub) this.typeSub.unsubscribe();
    if (this.pageSub) this.pageSub.unsubscribe();
    if (this.searchSub) this.searchSub.unsubscribe();
  }
}
