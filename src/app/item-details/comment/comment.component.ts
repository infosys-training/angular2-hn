import { Component, Input, OnInit } from '@angular/core';

import { Comment } from '../../shared/models/comment';

import { RouterLinkActive, RouterLink } from '@angular/router';

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.scss'],
    imports: [RouterLinkActive, RouterLink]
})
export class CommentComponent implements OnInit {
  @Input() comment: Comment;
  collapse: boolean;

  constructor() {}

  ngOnInit() {
    this.collapse = false;
  }
}
