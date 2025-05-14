import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private loadingMap = new Map<string, boolean>();

  constructor() {}

  setLoading(loading: boolean, key: string = 'global'): void {
    if (loading) {
      this.loadingMap.set(key, true);
    } else {
      this.loadingMap.delete(key);
    }

    this.loadingSubject.next(this.loadingMap.size > 0);
  }

  isLoading(key: string = 'global'): boolean {
    return this.loadingMap.has(key);
  }
}
