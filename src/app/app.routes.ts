import { Routes } from '@angular/router';

import { FeedComponent } from './feeds/feed/feed.component';

const feedRoutes: Routes = [{
  path: ':page',
  component: FeedComponent
}];

export const routes: Routes = [
  {path: '', redirectTo: 'news/1', pathMatch: 'full'},
  {
    path: 'news',
    children: feedRoutes,
    data: {feedType: 'news'}
  },
  {
    path: 'newest',
    children: feedRoutes,
    data: {feedType: 'newest'}
  },
  {
    path: 'show',
    children: feedRoutes,
    data: {feedType: 'show'}
  },
  {
    path: 'ask',
    children: feedRoutes,
    data: {feedType: 'ask'}
  },
  {
    path: 'jobs',
    children: feedRoutes,
    data: {feedType: 'jobs'}
  },
  {path: 'item', loadChildren: () => import('./item-details/item-details.routes').then(m => m.itemDetailsRoutes)},
  {path: 'user', loadChildren: () => import('./user/user.routes').then(m => m.userRoutes)}
];
