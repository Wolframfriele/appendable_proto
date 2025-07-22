import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, concatMap, EMPTY, map, Observable, Subject } from 'rxjs';
import { UrlDatetimePipe } from '../../pipes/url-datetime.pipe';

interface DateRangeState {
  start: Date;
  end: Date;
  error: String | null,
}

interface NextDataJson {
  entry_timestamp: string,
}

@Injectable({
  providedIn: 'root'
})
export class DateRangeService {
  private AS_JSON_HEADERS = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  toUrlDateTime = new UrlDatetimePipe();

  http = inject(HttpClient);

  // state
  private state = signal<DateRangeState>({
    start: this.getTodayStart(),
    end: this.getTodayEnd(),
    error: null,
  });

  // selectors
  start = computed(() => this.state().start);

  // sources
  expand$ = new Subject<undefined>();

  // outputs
  dateRangeExpanded$ = toObservable(this.state);

  constructor() {
    this.expand$
      .pipe(
        concatMap(() => {
          console.log(`Loading more entries`);
          return this.http
            .get<NextDataJson>(`/api/earlier_entry/${this.toUrlDateTime.transform(this.state().start)}`)
            .pipe(catchError((err) => this.handleError(err)))
        }),
        map(response => this.mapToNextDate(response)),
        takeUntilDestroyed(),
      )
      .subscribe((response) =>
        this.state.set({
          start: response,
          end: this.getTodayEnd(),
          error: null,
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

  private mapToNextDate(response: NextDataJson): Date {
    let nextEntryDate = new Date(response.entry_timestamp);
    nextEntryDate.setUTCHours(0, 0, 0, 0);
    return nextEntryDate;
  }

  private handleError(err: any) {
    this.state.update((state) => ({ ...state, error: err }));
    return EMPTY;
  }


  //private subtractDay(date: Date): Date {
  //  const result = new Date(date);
  //  result.setDate(result.getDate() - 1);
  //  return result;
  //}
}
