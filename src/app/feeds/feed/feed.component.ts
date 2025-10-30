import { Component, OnInit } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { FavoritesService } from '../../shared/services/favorites.service';
import { Story } from '../../shared/models/story';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})

export class FeedComponent implements OnInit {
  typeSub: Subscription;
  pageSub: Subscription;
  items: Story[];
  feedType: string;
  pageNum: number;
  listStart: number;
  errorMessage = '';

  constructor(
    private _hackerNewsAPIService: HackerNewsAPIService,
    private _favoritesService: FavoritesService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.typeSub = this.route
      .data
      .subscribe(data => {
        this.feedType = (data as any).feedType;
      });

    this.pageSub = this.route.params.subscribe(params => {
      this.pageNum = params.page ? +params.page : 1;

      if (this.feedType === 'favorites') {
        this.loadFavorites();
      } else {
        this._hackerNewsAPIService.fetchFeed(this.feedType, this.pageNum)
          .subscribe(
            items => this.items = items,
            error => this.errorMessage = 'Could not load ' + this.feedType + ' stories.',
            () => {
              this.listStart = ((this.pageNum - 1) * 30) + 1;
              window.scrollTo(0, 0);
            }
          );
      }
    });
  }

  loadFavorites() {
    const favoriteIds = this._favoritesService.getFavorites();

    if (favoriteIds.length === 0) {
      this.items = [];
      this.listStart = 1;
      window.scrollTo(0, 0);
      return;
    }

    const startIndex = (this.pageNum - 1) * 30;
    const endIndex = startIndex + 30;
    const pageIds = favoriteIds.slice(startIndex, endIndex);

    const requests = pageIds.map(id => this._hackerNewsAPIService.fetchItemContent(id));

    forkJoin(requests).subscribe(
      items => this.items = items,
      error => this.errorMessage = 'Could not load favorite stories.',
      () => {
        this.listStart = startIndex + 1;
        window.scrollTo(0, 0);
      }
    );
  }
}
