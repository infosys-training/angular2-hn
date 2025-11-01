import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchTermSubject = new BehaviorSubject<string>('');
  public searchTerm$ = this.searchTermSubject.asObservable();

  constructor() { }

  setSearchTerm(term: string): void {
    this.searchTermSubject.next(term);
  }

  getCurrentSearchTerm(): string {
    return this.searchTermSubject.value;
  }
}
