import { computed, inject, Injectable, signal } from "@angular/core";
import { DateRangeService } from "./date-range.service";
import {
  catchError,
  concatMap,
  EMPTY,
  map,
  merge,
  Observable,
  startWith,
  Subject,
  switchMap,
  take,
} from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Entry, RemoveEntry } from "../../model/entry.model";
import { mapToEntries, mapToJsonEntry } from "../../model/entry.mapper";
import { EntryJson } from "../../model/entry.interface";

interface EntryState {
  entries: Map<number, Entry[]>;
  loaded: boolean;
  error: String | null;
  activeIdx: number;
}

@Injectable({
  providedIn: "root",
})
export class EntryService {
  private AS_JSON_HEADERS = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  private http = inject(HttpClient);
  private dateRangeService = inject(DateRangeService);

  private state = signal<EntryState>({
    entries: new Map<number, Entry[]>(),
    loaded: false,
    error: null,
    activeIdx: 0,
  });

  entries = computed(() => this.state().entries);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);
  activeIdx = computed(() => this.state().activeIdx);

  add$ = new Subject<Entry>();
  edit$ = new Subject<Entry>();
  remove$ = new Subject<RemoveEntry>();

  private reloaded$ = new Subject<void>();

  constructor() {
    const entryAdded$ = this.add$.pipe(
      concatMap((addEntry) => {
        console.log(`New entry`);
        this.state.update((state) => ({ ...state, loaded: false }));
        return this.http
          .post(`/api/entries`, mapToJsonEntry(addEntry), this.AS_JSON_HEADERS)
          .pipe(catchError((err) => this.handleError(err)));
      }),
    );

    const entryEdited$ = this.edit$.pipe(
      concatMap((editEntry) => {
        console.log(`Edit entry: ${editEntry.id}`);
        this.state.update((state) => ({ ...state, loaded: false }));
        return this.http
          .put(
            `/api/entries/${editEntry.id}`,
            mapToJsonEntry(editEntry),
            this.AS_JSON_HEADERS,
          )
          .pipe(catchError((err) => this.handleError(err)));
      }),
    );

    const entryRemoved$ = this.remove$.pipe(
      concatMap((removeEntry) => {
        console.log(`Removing entry: ${removeEntry.id}`);
        this.state.update((state) => ({ ...state, loaded: false }));
        return this.http
          .delete(`/api/entries/${removeEntry.id}`)
          .pipe(catchError((err) => this.handleError(err)));
      }),
    );

    merge(
      entryAdded$,
      entryEdited$,
      entryRemoved$,
      this.dateRangeService.dateRangeExpanded$,
    )
      .pipe(
        startWith(null),
        switchMap(() =>
          this.http
            .get<
              EntryJson[]
            >(`/api/entries?start=${this.dateRangeService.start().toISOString()}`)
            .pipe(catchError((err) => this.handleError(err))),
        ),
        map((json: EntryJson[]) => mapToEntries(json)),
        map((entries) => this.groupEntriesByParent(entries)),
        takeUntilDestroyed(),
      )
      .subscribe((entries) => {
        console.log("Updated the state");
        this.state.update((state) => ({
          ...state,
          entries,
          loaded: true,
        }));

        this.reloaded$.next();
      });
  }

  public awaitAdd(entry: Entry): Observable<void> {
    this.add$.next(entry);
    return this.waitUntilReloaded();
  }

  public awaitRemove(removeEntry: RemoveEntry): Observable<void> {
    this.remove$.next(removeEntry);
    return this.waitUntilReloaded();
  }

  private groupEntriesByParent(entries: Entry[]): Map<number, Entry[]> {
    const grouped = new Map<number, Entry[]>();

    for (const entry of entries) {
      if (!grouped.has(entry.parent)) {
        grouped.set(entry.parent, []);
      }
      grouped.get(entry.parent)!.push(entry);
    }
    return grouped;
  }

  private handleError(err: any) {
    this.state.update((state) => ({ ...state, error: err }));
    return EMPTY;
  }

  private waitUntilReloaded(): Observable<void> {
    return this.reloaded$.asObservable().pipe(take(1));
  }
}
