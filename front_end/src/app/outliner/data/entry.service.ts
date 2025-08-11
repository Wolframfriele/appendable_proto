import { computed, inject, Injectable, signal } from "@angular/core";
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
} from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Entry, RemoveEntry } from "../../model/entry.model";
import { mapToEntries, mapToJsonEntry } from "../../model/entry.mapper";
import { EntryJson } from "../../model/entry.interface";
import { Command, CommandService } from "../../shared/data/command.service";

export interface EntryState {
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
  private commandService = inject(CommandService);

  // state
  private state = signal<EntryState>({
    entries: new Map<number, Entry[]>(),
    loaded: false,
    error: null,
    activeIdx: 0,
  });

  // selectors
  entries = computed(() => this.state().entries);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);
  activeEntryIdx = computed(() => this.state().activeIdx);

  // sources
  add$ = new Subject<Entry>();
  edit$ = new Subject<Entry>();
  remove$ = new Subject<RemoveEntry>();

  constructor() {
    const entryAdded$ = this.add$.pipe(
      concatMap((addEntry) => {
        console.log(`New entry: with text: ${addEntry.text}`);
        return this.http
          .post(`/api/entries`, mapToJsonEntry(addEntry), this.AS_JSON_HEADERS)
          .pipe(catchError((err) => this.handleError(err)));
      }),
    );

    const entryEdited$ = this.edit$.pipe(
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
    );

    const entryRemoved$ = this.remove$.pipe(
      concatMap((removeEntry) => {
        console.log(`Removing entry: ${removeEntry.id}`);
        return this.http
          .delete(`/api/entries/${removeEntry.id}`)
          .pipe(catchError((err) => this.handleError(err)));
      }),
    );

    // reducers
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
        this.state.update((state) => ({
          ...state,
          entries,
          loaded: true,
        }));
      });
  }

  //   this.commandService.executeCommand$.subscribe((command) => {
  //     switch (command) {
  //       case Command.MOVE_TO_PREVIOUS_ENTRY:
  //         this.moveToPreviousEntry();
  //         break;
  //       case Command.MOVE_TO_NEXT_ENTRY:
  //         this.moveToNextEntry();
  //         break;
  //       case Command.ADD_NEW_ENTRY:
  //         this.addNewEntryBelowActive();
  //         break;
  //       case Command.ADD_NEW_CHILD_ENTRY:
  //         break;
  //     }
  //   });
  // }

  // public activateEntry(idx: number, day: Date) {
  //   const roundedDay = this.toRoundDate.transform(day);
  //   const entriesForDay = this.entries().get(roundedDay);
  //   if (entriesForDay && entriesForDay.length > idx) {
  //     this.state.update((state) => ({
  //       ...state,
  //       activeIdx: idx,
  //       activeDay: roundedDay,
  //     }));
  //   }
  // }

  // public activateEntryById(id: number) {
  //   this.entries().forEach((entriesForDay, day) => {
  //     const foundEntry = entriesForDay.find((entry) => entry.id === id);
  //     if (foundEntry) {
  //       const idx = entriesForDay.indexOf(foundEntry);
  //       this.state.update((state) => ({
  //         ...state,
  //         activeIdx: idx,
  //         activeDay: day,
  //       }));
  //     }
  //   });
  // }

  private handleError(err: any) {
    this.state.update((state) => ({ ...state, error: err }));
    return EMPTY;
  }

  private groupEntriesByParent(entries: Entry[]): Map<number, Entry[]> {
    const grouped = new Map<number, Entry[]>();

    for (const entry of entries) {
      if (!grouped.has(entry.parent)) {
        grouped.set(entry.parent, []);
      }
      grouped.get(entry.parent)!.push(entry);
    }
    console.log(grouped);

    return grouped;
  }

  private newEmptyEntry(parent: number): Entry {
    return {
      id: 0,
      parent: parent,
      nesting: 0,
      text: "",
      showTodo: false,
      isDone: false,
    };
  }

  // private moveToPreviousEntry() {
  //   if (this.state().activeIdx > 0) {
  //     this.state.update((state) => ({
  //       ...state,
  //       activeIdx: state.activeIdx - 1,
  //     }));
  //   } else {
  //     const previousDay = this.previousDay();
  //     if (previousDay) {
  //       const amountOfEntriesInPreviousDay =
  //         this.entries().get(previousDay)?.length;

  //       if (amountOfEntriesInPreviousDay) {
  //         this.state.update((state) => ({
  //           ...state,
  //           activeIdx: amountOfEntriesInPreviousDay - 1,
  //           activeDay: previousDay,
  //         }));
  //       }
  //     }
  //   }
  // }

  // private moveToNextEntry() {
  //   const amountOfEntriesInCurrentDay = this.entries().get(
  //     this.state().activeDay,
  //   )?.length;
  //   if (
  //     amountOfEntriesInCurrentDay &&
  //     this.state().activeIdx < amountOfEntriesInCurrentDay - 1
  //   ) {
  //     this.state.update((state) => ({
  //       ...state,
  //       activeIdx: state.activeIdx + 1,
  //     }));
  //   } else {
  //     const nextDay = this.nextDay();
  //     if (nextDay) {
  //       if (this.entries().has(nextDay)) {
  //         this.state.update((state) => ({
  //           ...state,
  //           activeIdx: 0,
  //           activeDay: nextDay,
  //         }));
  //       }
  //     }
  //   }
  // }

  // private previousDay(): string | undefined {
  //   const loadedDays = Array.from(this.entries().keys());
  //   loadedDays.sort().reverse();

  //   const currentDayIdx = loadedDays.indexOf(this.activeDay());
  //   if (currentDayIdx > 0) {
  //     return loadedDays[currentDayIdx - 1];
  //   }

  //   return undefined;
  // }

  // private nextDay() {
  //   const loadedDays = Array.from(this.entries().keys());
  //   loadedDays.sort().reverse();

  //   const currentDayIdx = loadedDays.indexOf(this.activeDay());
  //   if (currentDayIdx >= 0 && currentDayIdx < loadedDays.length) {
  //     return loadedDays[currentDayIdx + 1];
  //   }

  //   return undefined;
  // }

  // // Tries to convert the activeDay and activeEntryIdx to an actual Entry object
  // findActiveEntry(): Entry | undefined {
  //   const entriesActiveDay = this.entries().get(this.activeDay());
  //   if (entriesActiveDay && entriesActiveDay.length > this.activeEntryIdx()) {
  //     return entriesActiveDay[this.activeEntryIdx()];
  //   }
  //   return undefined;
  // }

  // private addNewEntryBelowActive() {
  //   const activeEntry = this.findActiveEntry();
  //   if (activeEntry) {
  //     this.add$.next({
  //       id: 0,
  //       parent: activeEntry.parent,
  //       path: activeEntry.path,
  //       nesting: activeEntry.nesting,
  //       startTimestamp: new Date(),
  //       endTimestamp: undefined,
  //       text: "",
  //       showTodo: false,
  //       isDone: false,
  //       estimatedDuration: 0,
  //       tags: [],
  //     });

  //     // need to handle not pressing enter on the most bottom option
  //     this.state.update((state) => ({
  //       ...state,
  //       activeIdx: state.activeIdx + 1,
  //     }));
  //   }
  // }
}
