import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';
import { SettingsService } from '../../shared/services/settings.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})

export class FeedComponent implements OnInit, OnDestroy {
  typeSub: Subscription;
  pageSub: Subscription;
  items: Story[];
  filteredItems: Story[];
  feedType: string;
  pageNum: number;
  listStart: number;
  errorMessage = '';
  searchText: string = '';

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
            this.filterItems();
          },
          error => this.errorMessage = 'Could not load ' + this.feedType + ' stories.',
          () => {
            this.listStart = ((this.pageNum - 1) * 30) + 1;
            window.scrollTo(0, 0);
          }
        );
    });

    setInterval(() => {
      const currentSearchText = this._settingsService.settings.searchText;
      if (currentSearchText !== this.searchText) {
        this.searchText = currentSearchText;
        this.filterItems();
      }
    }, 100);
  }

  ngOnDestroy() {
    if (this.typeSub) {
      this.typeSub.unsubscribe();
    }
    if (this.pageSub) {
      this.pageSub.unsubscribe();
    }
  }

  filterItems() {
    if (!this.items) {
      return;
    }
    if (!this.searchText || this.searchText.trim() === '') {
      this.filteredItems = this.items;
    } else {
      const searchLower = this.searchText.toLowerCase();
      this.filteredItems = this.items.filter(item => 
        item.title && item.title.toLowerCase().includes(searchLower)
      );
    }
  }
}
