import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    standalone: false
})
export class UserComponent implements OnInit {
  private _hackerNewsAPIService = inject(HackerNewsAPIService);
  private route = inject(ActivatedRoute);
  private _location = inject(Location);

  sub: Subscription;
  user: User;
  errorMessage = '';

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      const userID = params['id'];
      this._hackerNewsAPIService.fetchUser(userID).subscribe(data => {
        this.user = data;
      }, error => this.errorMessage = 'Could not load user ' + userID + '.');
    });
  }

  goBack() {
    this._location.back();
  }
}
