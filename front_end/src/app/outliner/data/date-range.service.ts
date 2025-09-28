import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  catchError,
  concatMap,
  EMPTY,
  map,
  Observable,
  startWith,
  Subject,
  take,
} from "rxjs";

interface NextDataJson {
  block_timestamp: string;
}

@Injectable({
  providedIn: "root",
})
export class DateRangeService {
  private http = inject(HttpClient);

  readonly start = signal(this.getTodayStart());
  readonly end = signal(this.getTodayEnd());
  readonly error = signal(null);

  private expand$ = new Subject<void>();

  readonly dateRangeExpanded$: Observable<Date> = this.expand$.pipe(
    startWith(undefined),
    concatMap(() => {
      return this.http
        .get<NextDataJson>(
          `/api/blocks/next_before/${this.start().toISOString()}`,
        )
        .pipe(catchError((err) => this.handleError(err)));
    }),
    map((response) => this.mapToNextDate(response)),
    takeUntilDestroyed(),
  );

  constructor() {
    this.dateRangeExpanded$.subscribe((newStartDate) =>
      this.start.set(newStartDate),
    );
  }

  public expand(): Observable<Date> {
    this.expand$.next(undefined);
    return this.dateRangeExpanded$.pipe(take(1));
  }

  private getTodayStart(): Date {
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
  }

  private getTodayEnd(): Date {
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );
  }

  private mapToNextDate(response: NextDataJson): Date {
    let nextEntryDate = new Date(response.block_timestamp);
    nextEntryDate.setUTCHours(0, 0, 0, 0);
    return nextEntryDate;
  }

  private handleError(err: any) {
    this.error.set(err);
    return EMPTY;
  }
}
