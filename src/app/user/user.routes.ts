import { Routes } from '@angular/router';

import { UserComponent } from './user.component';

export const userRoutes: Routes = [
  {
    path: ':id',
    component: UserComponent
  }
];
