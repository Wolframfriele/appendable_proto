import { computed, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';

interface DateRangeState {
  start: Date;
  end: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DateRangeService {

  // state
  private state = signal<DateRangeState>({
    start: this.getTodayStart(),
    end: this.getTodayEnd(),
  });

  // selectors
  start = computed(() => this.state().start);

  // sources
  expand$ = new Subject<undefined>();

  // outputs
  dateRangeExpanded$ = toObservable(this.state);

  constructor() {
    this.expand$
      .pipe(takeUntilDestroyed())
      .subscribe(() =>
        this.state.set({
          start: this.subtractDay(this.state().start),
          end: this.getTodayEnd(),
        })
      );
  }

  private getTodayStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  }

  private getTodayEnd(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  }

  private subtractDay(date: Date): Date {
    const result = new Date(date);
    result.setDate(result.getDate() - 1);
    return result;
  }
}
