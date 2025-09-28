import { inject, Injectable, signal } from "@angular/core";
import { DateRangeService } from "./date-range.service";
import {
  catchError,
  concatMap,
  EMPTY,
  map,
  merge,
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

@Injectable({
  providedIn: "root",
})
export class EntryService {
  private AS_JSON_HEADERS = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  private http = inject(HttpClient);
  private dateRangeService = inject(DateRangeService);

  readonly entries = signal<Map<number, Entry[]>>(new Map());
  readonly loaded = signal(false);
  readonly error = signal<string | null>(null);

  private add$ = new Subject<Entry>();
  private edit$ = new Subject<Entry>();
  private remove$ = new Subject<RemoveEntry>();

  private entries$ = merge(
    this.add$.pipe(
      concatMap((addEntry) => {
        console.log(`New entry`);
        return this.http
          .post(`/api/entries`, mapToJsonEntry(addEntry), this.AS_JSON_HEADERS)
          .pipe(catchError((err) => this.handleError(err)));
      }),
    ),
    this.edit$.pipe(
      concatMap((editEntry) => {
        console.log(`Edit entry: ${editEntry.id}`);
        return this.http
          .put(
            `/api/entries/${editEntry.id}`,
            mapToJsonEntry(editEntry),
            this.AS_JSON_HEADERS,
          )
          .pipe(catchError((err) => this.handleError(err)));
      }),
    ),
    this.remove$.pipe(
      concatMap((removeEntry) => {
        console.log(`Removing entry: ${removeEntry.id}`);
        return this.http
          .delete(`/api/entries/${removeEntry.id}`)
          .pipe(catchError((err) => this.handleError(err)));
      }),
    ),
    this.dateRangeService.dateRangeExpanded$,
  ).pipe(
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
  );

  constructor() {
    this.entries$.subscribe((entries) => this.entries.set(entries));
  }

  public add(entry: Entry) {
    this.add$.next(entry);
    return this.entries$.pipe(take(1));
  }

  public edit(entry: Entry) {
    this.edit$.next(entry);
    return this.entries$.pipe(take(1));
  }

  public remove(id: number) {
    this.remove$.next({ id });
    return this.entries$.pipe(take(1));
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
    this.error.set(err);
    return EMPTY;
  }
}
