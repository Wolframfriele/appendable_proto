import { HttpClient } from "@angular/common/http";
import { computed, inject, Injectable, signal } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { catchError, concatMap, EMPTY, map, startWith, Subject } from "rxjs";

interface DateRangeState {
  start: Date;
  end: Date;
  error: String | null;
}

interface NextDataJson {
  block_timestamp: string;
}

@Injectable({
  providedIn: "root",
})
export class DateRangeService {
  private http = inject(HttpClient);

  // state
  private state = signal<DateRangeState>({
    start: this.getTodayStart(),
    end: this.getTodayEnd(),
    error: null,
  });

  start = computed(() => this.state().start);
  end = computed(() => this.state().end);

  expand$ = new Subject<undefined>();

  dateRangeExpanded$ = toObservable(this.state);

  constructor() {
    this.expand$
      .pipe(
        startWith(undefined),
        concatMap(() => {
          return this.http
            .get<NextDataJson>(
              `/api/earlier_blocks/${this.state().start.toISOString()}`,
            )
            .pipe(catchError((err) => this.handleError(err)));
        }),
        map((response) => this.mapToNextDate(response)),
        takeUntilDestroyed(),
      )
      .subscribe((response) =>
        this.state.set({
          start: response,
          end: this.getTodayEnd(),
          error: null,
        }),
      );
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
    this.state.update((state) => ({ ...state, error: err }));
    return EMPTY;
  }
}
