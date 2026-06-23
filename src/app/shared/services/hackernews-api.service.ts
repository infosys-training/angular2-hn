import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import fetch from 'unfetch';
import {map } from 'rxjs/operators';

import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';
import { environment } from '../../../environments/environment';

// Microservices architecture:
//   Gateway (:3000) → Feed Service (:3001), Item Service (:3002), User Service (:3003)
// When apiGatewayUrl is set, requests go through the gateway.
// When empty, falls back to the original external HN API.
@Injectable()
export class HackerNewsAPIService {
  baseUrl: string;

  constructor() {
    this.baseUrl = environment.apiGatewayUrl || 'https://node-hnapi.herokuapp.com';
  }

  fetchFeed(feedType: string, page: number): Observable<Story[]> {
    const url = environment.apiGatewayUrl
      ? `${this.baseUrl}/api/feeds/${feedType}?page=${page}`
      : `${this.baseUrl}/${feedType}?page=${page}`;
    return lazyFetch(url).pipe(map((response: any) => {
      // Gateway wraps items in { items, feedType, page, hasMore }
      return response.items || response;
    }));
  }

  fetchItemContent(id: number): Observable<Story> {
    const url = environment.apiGatewayUrl
      ? `${this.baseUrl}/api/items/${id}`
      : `${this.baseUrl}/item/${id}`;
    return lazyFetch(url).pipe(map((story: Story) => {
      if (!environment.apiGatewayUrl && story.type === 'poll') {
        // Poll enrichment handled server-side in item-service when using gateway
        let numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        for (let i = 1; i <= numberOfPollOptions; i++) {
          this.fetchPollContent(story.id + i).subscribe(pollResults => {
            story.poll[i - 1] = pollResults;
            story.poll_votes_count += pollResults.points;
          });
        }
      }
      return story;
    }));
  }

  fetchPollContent(id: number): Observable<PollResult> {
    const url = environment.apiGatewayUrl
      ? `${this.baseUrl}/api/items/${id}`
      : `${this.baseUrl}/item/${id}`;
    return lazyFetch(url);
  }

  fetchUser(id: string): Observable<User> {
    const url = environment.apiGatewayUrl
      ? `${this.baseUrl}/api/users/${id}`
      : `${this.baseUrl}/user/${id}`;
    return lazyFetch(url);
  }
}

function lazyFetch<T>(url, options?) {
  return new Observable<T>(fetchObserver => {
    let cancelToken = false;
    fetch(url, options)
      .then(res => {
        if (!cancelToken) {
          return res.json()
            .then(data => {
              fetchObserver.next(data);
              fetchObserver.complete();
            });
        }
      }).catch(err => fetchObserver.error(err));
    return () => {
      cancelToken = true;
    };
  });
}

