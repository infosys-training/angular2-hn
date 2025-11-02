import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { SearchService } from '../../shared/services/search.service';
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
  originalItems: Story[];
  feedType: string;
  pageNum: number;
  listStart: number;
  errorMessage = '';

  constructor(
    private hackerNewsAPIService: HackerNewsAPIService,
    private searchService: SearchService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.typeSub = this.route
      .data
      .subscribe(data => {
        this.feedType = (data as any).feedType;
      });

    this.pageSub = this.route.params.subscribe(params => {
      this.pageNum = params['page'] ? +params['page'] : 1;
      this.hackerNewsAPIService.fetchFeed(this.feedType, this.pageNum)
        .subscribe(
          items => {
            this.originalItems = items;
            this.items = items;
            this.applySearchFilter();
          },
          error => this.errorMessage = 'Could not load ' + this.feedType + ' stories.',
          () => {
            this.listStart = ((this.pageNum - 1) * 30) + 1;
            window.scrollTo(0, 0);
          }
        );
    });

    this.searchSub = this.searchService.searchTerm$.subscribe(searchTerm => {
      this.applySearchFilter(searchTerm);
    });
  }

  applySearchFilter(searchTerm: string = '') {
    if (!this.originalItems) {
      return;
    }

    if (!searchTerm || searchTerm.trim() === '') {
      this.items = this.originalItems;
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase();
      this.items = this.originalItems.filter(item =>
        item.title && item.title.toLowerCase().includes(lowerSearchTerm)
      );
    }
  }

  ngOnDestroy() {
    if (this.typeSub) {
      this.typeSub.unsubscribe();
    }
    if (this.pageSub) {
      this.pageSub.unsubscribe();
    }
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }
}
