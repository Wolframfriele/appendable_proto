import { computed, inject, Injectable, signal } from '@angular/core';
import { DateRangeService } from './date-range.service';
import { catchError, concatMap, EMPTY, map, merge, startWith, Subject, switchMap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Entry, RemoveEntry } from '../../model/entry.model';
import { mapToEntries, mapToEntry, mapToJsonEntry } from '../../model/entry.mapper';
import { EntryWithTagJson } from '../../model/entry.interface';
import { UrlDatetimePipe } from '../../pipes/url-datetime.pipe';
import { RoundDatePipe } from '../../pipes/round-date.pipe';
import { Command, CommandService } from '../../shared/data/command.service';

export interface EntryState {
  entries: Map<string, Entry[]>,
  loaded: boolean,
  error: String | null,
  activeDay: string,
  activeIdx: number,
}

@Injectable({
  providedIn: 'root'
})
export class EntryService {
  private AS_JSON_HEADERS = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  private commandService = inject(CommandService);

  private toUrlDateTime = new UrlDatetimePipe();
  private toRoundDate = new RoundDatePipe();

  private dateRangeService = inject(DateRangeService);
  private http = inject(HttpClient);

  // state
  private state = signal<EntryState>({
    entries: new Map<string, Entry[]>,
    loaded: false,
    error: null,
    activeDay: this.toRoundDate.transform(new Date()),
    activeIdx: 0,
  });

  // selectors
  entries = computed(() => this.state().entries);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);
  activeDay = computed(() => this.state().activeDay);
  activeEntryIdx = computed(() => this.state().activeIdx);

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

    this.commandService.executeCommand$.subscribe(
      (command) => {
        switch (command) {
          case Command.MOVE_TO_PREVIOUS_ENTRY:
            this.moveToPreviousEntry();
            break;
          case Command.MOVE_TO_NEXT_ENTRY:
            this.moveToNextEntry();
            break;
          case Command.ADD_NEW_ENTRY:
            this.addNewEntryBelowActive();
            break;
          case Command.ADD_NEW_CHILD_ENTRY:
            break;
        }
      }
    )
  }

  public activateEntry(idx: number, day: Date) {
    const roundedDay = this.toRoundDate.transform(day);
    const entriesForDay = this.entries().get(roundedDay);
    if (entriesForDay && entriesForDay.length > idx) {
      this.state.update((state) =>
        ({ ...state, activeIdx: idx, activeDay: roundedDay }));
    }
  }

  public activateEntryById(id: number) {
    this.entries().forEach((entriesForDay, day) => {
      const foundEntry = entriesForDay.find((entry) => entry.id === id)
      if (foundEntry) {
        const idx = entriesForDay.indexOf(foundEntry);
        this.state.update((state) =>
          ({ ...state, activeIdx: idx, activeDay: day }))
      }
    })
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

  private moveToPreviousEntry() {
    if (this.state().activeIdx > 0) {
      this.state.update((state) =>
        ({ ...state, activeIdx: state.activeIdx - 1 })
      );
    } else {
      const previousDay = this.previousDay();
      if (previousDay) {
        const amountOfEntriesInPreviousDay = this.entries().get(previousDay)?.length;

        if (amountOfEntriesInPreviousDay) {
          this.state.update((state) =>
            ({ ...state, activeIdx: amountOfEntriesInPreviousDay - 1, activeDay: previousDay })
          );
        }
      }
    }
  }

  private moveToNextEntry() {
    const amountOfEntriesInCurrentDay = this.entries().get(this.state().activeDay)?.length;
    if (amountOfEntriesInCurrentDay && this.state().activeIdx < (amountOfEntriesInCurrentDay - 1)) {
      this.state.update((state) =>
        ({ ...state, activeIdx: state.activeIdx + 1 })
      );
    } else {
      const nextDay = this.nextDay();
      if (nextDay) {
        if (this.entries().has(nextDay)) {
          this.state.update((state) =>
            ({ ...state, activeIdx: 0, activeDay: nextDay })
          );
        }
      }
    }
  }

  private previousDay(): string | undefined {
    const loadedDays = Array.from(this.entries().keys());
    loadedDays.sort().reverse();

    const currentDayIdx = loadedDays.indexOf(this.activeDay());
    if (currentDayIdx > 0) {
      return loadedDays[currentDayIdx - 1];
    }

    return undefined;
  }

  private nextDay() {
    const loadedDays = Array.from(this.entries().keys());
    loadedDays.sort().reverse();

    const currentDayIdx = loadedDays.indexOf(this.activeDay());
    if (currentDayIdx >= 0 && currentDayIdx < loadedDays.length) {
      return loadedDays[currentDayIdx + 1];
    }

    return undefined;
  }

  // Tries to convert the activeDay and activeEntryIdx to an actual Entry object
  findActiveEntry(): Entry | undefined {
    const entriesActiveDay = this.entries().get(this.activeDay());
    if (entriesActiveDay && entriesActiveDay.length > this.activeEntryIdx()) {
      return entriesActiveDay[this.activeEntryIdx()];
    }
    return undefined;

  }

  private addNewEntryBelowActive() {
    const activeEntry = this.findActiveEntry();
    if (activeEntry) {
      this.add$.next({
        id: 0,
        parent: activeEntry.parent,
        path: activeEntry.path,
        nesting: activeEntry.nesting,
        startTimestamp: new Date(),
        endTimestamp: undefined,
        text: '',
        showTodo: false,
        isDone: false,
        estimatedDuration: 0,
        tags: []
      })

      // need to handle not pressing enter on the most bottom option
      this.state.update((state) => ({ ...state, activeIdx: state.activeIdx + 1 }));
    }
  }
}
