import { computed, inject, Injectable, signal } from '@angular/core';
import { DateRangeService } from './date-range.service';
import { catchError, concatMap, EMPTY, map, merge, startWith, Subject, switchMap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Entry, RemoveEntry } from '../../model/entry.model';
import { mapToEntries, mapToJsonEntry } from '../../model/entry.mapper';
import { EntryWithTagJson } from '../../model/entry.interface';
import { UrlDatetimePipe } from '../../pipes/url-datetime.pipe';
import { RoundDatePipe } from '../../pipes/round-date.pipe';

export interface EntryState {
  entries: Map<string, Entry[]>,
  loaded: boolean,
  error: String | null,
}

@Injectable({
  providedIn: 'root'
})
export class EntryService {
  private AS_JSON_HEADERS = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  toUrlDateTime = new UrlDatetimePipe();
  toRoundDate = new RoundDatePipe();

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
  remove$ = new Subject<RemoveEntry>();

  constructor() {
    const entryAdded$ = this.add$.pipe(

      concatMap((addEntry) => {
        addEntry.startTimestamp = new Date();

        console.log(`New entry: with text: ${addEntry.text}`);
        return this.http
          .post(`/api/entries`, mapToJsonEntry(addEntry), this.AS_JSON_HEADERS)
          .pipe(catchError((err) => this.handleError(err)));
      })
    );

    const entryEdited$ = this.edit$.pipe(
      concatMap((editEntry) => {
        console.log(`Edit entry: ${editEntry.id}`);
        return this.http
          .put(`/api/entries/${editEntry.id}`, mapToJsonEntry(editEntry), this.AS_JSON_HEADERS)
          .pipe(catchError((err) => this.handleError(err)))
      })
    );

    const entryRemoved$ = this.remove$.pipe(
      concatMap((removeEntry) => {
        console.log(`Removing entry: ${removeEntry.id}, with children: ${removeEntry.withChildren}`);
        return this.http
          .delete(`/api/entries/${removeEntry.id}?with_children=${removeEntry.withChildren}`)
          .pipe(catchError((err) => this.handleError(err)))
      })
    );

    // reducers
    merge(entryAdded$, entryEdited$, entryRemoved$, this.dateRangeService.dateRangeExpanded$)
      .pipe(
        startWith(null),
        switchMap(() =>
          this.http
            .get<EntryWithTagJson[]>(`/api/entries?start=${this.toUrlDateTime.transform(this.dateRangeService.start())}`)
            .pipe(catchError((err) => this.handleError(err))),
        ),
        map((json: EntryWithTagJson[]) => mapToEntries(json)),
        map((entries) => this.groupEntriesByDay(entries)),
        map((entries) => this.addEmptyEntryIfTodayEmpty(entries)),
        takeUntilDestroyed(),
      )
      .subscribe((entries) => {
        this.state.update((state) => ({
          ...state,
          entries,
          loaded: true,
        }))
      });
  }

  private handleError(err: any) {
    this.state.update((state) => ({ ...state, error: err }));
    return EMPTY;
  }

  private groupEntriesByDay(entries: Entry[]): Map<string, Entry[]> {
    const grouped = new Map<string, Entry[]>();

    for (const entry of entries) {
      const day = this.toRoundDate.transform(entry.startTimestamp);
      if (!grouped.has(day)) {
        grouped.set(day, []);
      }
      grouped.get(day)!.push(entry);
    }

    return grouped;
  }

  private addEmptyEntryIfTodayEmpty(entries: Map<string, Entry[]>) {
    const today = this.toRoundDate.transform(new Date());

    if (!entries.has(today)) {
      entries.set(today, [this.newEmptyEntry()]);
    }

    return entries
  }

  private newEmptyEntry(): Entry {
    return {
      id: 0,
      parent: undefined,
      path: '/',
      nesting: 0,
      startTimestamp: new Date(),
      endTimestamp: undefined,
      text: '',
      showTodo: false,
      isDone: false,
      estimatedDuration: 0,
      tags: []
    };
  }
}
