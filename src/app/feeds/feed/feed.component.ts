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
  allItems: Story[];
  items: Story[];
  feedType: string;
  pageNum: number;
  listStart: number;
  errorMessage = '';
  searchTerm: string = '';

  constructor(
    private _hackerNewsAPIService: HackerNewsAPIService,
    private _searchService: SearchService,
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
      this._hackerNewsAPIService.fetchFeed(this.feedType, this.pageNum)
        .subscribe(
          items => {
            this.allItems = items;
            this.filterItems();
          },
          error => this.errorMessage = 'Could not load ' + this.feedType + ' stories.',
          () => {
            this.listStart = ((this.pageNum - 1) * 30) + 1;
            window.scrollTo(0, 0);
          }
        );
    });

    this.searchSub = this._searchService.searchTerm$.subscribe(term => {
      this.searchTerm = term;
      this.filterItems();
    });
  }

  filterItems() {
    if (!this.allItems) {
      return;
    }
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.items = this.allItems;
    } else {
      const lowerSearchTerm = this.searchTerm.toLowerCase();
      this.items = this.allItems.filter(item => 
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
