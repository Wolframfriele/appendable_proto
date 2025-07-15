import { computed, inject, Injectable, signal } from '@angular/core';
import { DateRangeService } from './date-range.service';
import { catchError, concatMap, EMPTY, map, merge, startWith, Subject, switchMap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Entry } from '../../model/entry.model';
import { mapToEntries, mapToJsonEntry } from '../../model/entry.mapper';
import { EntryWithTagJson } from '../../model/entry.interface';

export interface EntryState {
  entries: Map<string, Entry[]>,
  loaded: boolean,
  error: String | null,
}

@Injectable({
  providedIn: 'root'
})
export class EntryService {
  private dateRangeService = inject(DateRangeService);
  http = inject(HttpClient);

  // state
  private state = signal<EntryState>({
    entries: new Map<string, Entry[]>,
    loaded: false,
    error: null,
  });

  // selectors
  entries = computed(() => this.state().entries);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  // sources
  add$ = new Subject<Entry>();
  edit$ = new Subject<Entry>();
  remove$ = new Subject<Entry>();

  entryAdded$ = this.add$.pipe(
    concatMap((addEntry) => {
      addEntry.startTimestamp = new Date();
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const body = mapToJsonEntry(addEntry);

      console.log(`New entry: with text: ${addEntry.text}`);
      return this.http
        .post(`/api/entries`, body, { headers })
        .pipe(catchError((err) => this.handleError(err)));
    })
  );

  entryEdited$ = this.edit$.pipe(
    concatMap((editEntry) => {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const body = mapToJsonEntry(editEntry);

      console.log(`Edit entry: id: ${editEntry.id} changed txt to: ${editEntry.text}`);
      return this.http
        .put(`/api/entries/${editEntry.id}`, body, { headers })
        .pipe(catchError((err) => this.handleError(err)));
    })
  );

  constructor() {
    // reducers
    merge(this.entryAdded$, this.entryEdited$, this.dateRangeService.dateRangeExpanded$)
      .pipe(
        startWith(null),
        switchMap(() =>
          this.http
            .get<EntryWithTagJson[]>(`/api/entries?start=${this.toDateTimeStr(this.dateRangeService.start())}`)
            .pipe(catchError((err) => this.handleError(err))),
        ),
        map((json: EntryWithTagJson[]) => mapToEntries(json)),
        map((entries: Entry[]) => this.groupEntriesByDay(entries)),
        takeUntilDestroyed(),
      )
      .subscribe((entries) =>
        this.state.update((state) => ({
          ...state,
          entries,
          loaded: true,
        })),
      );
  }

  private handleError(err: any) {
    this.state.update((state) => ({ ...state, error: err }));
    return EMPTY;
  }

  private toDateTimeStr(input: Date): string {
    return formatDate(input, 'yyyy-MM-ddTHH:mm:ss', 'en-gb');
  }

  private groupEntriesByDay(entries: Entry[]): Map<string, Entry[]> {
    const grouped = new Map<string, Entry[]>();

    for (const entry of entries) {
      const day = this.toDateStr(entry.startTimestamp);
      if (!grouped.has(day)) {
        grouped.set(day, []);
      }
      grouped.get(day)!.push(entry);
    }

    let today = this.toDateStr(new Date());
    if (!grouped.has(today)) {
      grouped.set(today, []);
    }

    return grouped;
  }

  private toDateStr(input: Date): string {
    return input.toISOString().split("T")[0];
  }

}
