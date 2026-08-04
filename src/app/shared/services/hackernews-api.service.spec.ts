import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';

import { HackerNewsAPIService } from './hackernews-api.service';

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HackerNewsAPIService]
    });
    service = TestBed.inject(HackerNewsAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should point at the node-hnapi base url', () => {
    expect(service.baseUrl).toContain('hnapi');
  });

  it('fetchFeed should return a lazy Observable (no request until subscribe)', () => {
    expect(service.fetchFeed('news', 1)).toEqual(jasmine.any(Observable));
  });

  it('fetchItemContent should return an Observable', () => {
    expect(service.fetchItemContent(123)).toEqual(jasmine.any(Observable));
  });

  it('fetchPollContent should return an Observable', () => {
    expect(service.fetchPollContent(123)).toEqual(jasmine.any(Observable));
  });

  it('fetchUser should return an Observable', () => {
    expect(service.fetchUser('pg')).toEqual(jasmine.any(Observable));
  });
});
