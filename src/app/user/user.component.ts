import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    imports: [LoaderComponent, ErrorMessageComponent]
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
      let userID = params['id'];
      this._hackerNewsAPIService.fetchUser(userID).subscribe(data => {
        this.user = data;
      }, error => this.errorMessage = 'Could not load user ' + userID + '.');
    });
  }

  goBack() {
    this._location.back();
  }
}
