import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let component: FeedComponent;

  const stories = [{ id: 1, title: 'Story one' } as Story];

  const apiStub = {
    fetchFeed: jasmine.createSpy('fetchFeed').and.returnValue(of(stories))
  };

  const routeStub = {
    data: of({ feedType: 'news' }),
    params: of({ page: '2' })
  };

  beforeEach(() => {
    apiStub.fetchFeed.calls.reset();

    TestBed.configureTestingModule({
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiStub },
        { provide: ActivatedRoute, useValue: routeStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should resolve feedType from the route data', () => {
    expect(component.feedType).toBe('news');
  });

  it('should load feed items for the current page', () => {
    expect(apiStub.fetchFeed).toHaveBeenCalledWith('news', 2);
    expect(component.items).toEqual(stories);
  });

  it('should compute listStart from the page number', () => {
    expect(component.listStart).toBe(31);
  });
});
