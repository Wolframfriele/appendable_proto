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
import { BlockService } from "./block.service";
import { NavigationTargetService } from "../../shared/data/navigation-target.service";
import { NavigationTarget } from "../../app.routes";

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
  private blockService = inject(BlockService);
  private dateRangeService = inject(DateRangeService);
  private commandService = inject(CommandService);
  private navigationTargetService = inject(NavigationTargetService);

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

    this.commandService.executeCommand$.subscribe((command) => {
      switch (command) {
        case Command.ADD_NEW_ENTRY:
          this.add$.next(this.newEmptyEntry(this.blockService.active.id));
          break;
        case Command.MOVE_TO_PREVIOUS_ELEMENT:
          if (
            this.navigationTargetService.active() == NavigationTarget.OUTLINER
          ) {
            this.moveToPreviousEntry();
          }
          break;
        case Command.MOVE_TO_NEXT_ELEMENT:
          if (
            this.navigationTargetService.active() == NavigationTarget.OUTLINER
          ) {
            this.moveToNextEntry();
          }
          break;
        // Ugly fix to put this here, required to avoid circular dependency
        // but that probably is the result of a deeper design flaw
        case Command.MOVE_TO_PREVIOUS_CONTAINER:
          if (
            this.navigationTargetService.active() === NavigationTarget.OUTLINER
          ) {
            this.blockService.activatePrevious();
            // because moving to block requires active entry to be 0
            this.state.update((state) => ({ ...state, activeIdx: 0 }));
          }
          break;
        // Ugly fix to put this here, required to avoid circular dependency
        // but that probably is the result of a deeper design flaw
        case Command.MOVE_TO_NEXT_CONTAINER:
          if (
            this.navigationTargetService.active() === NavigationTarget.OUTLINER
          ) {
            this.blockService.activateNext();
            // because moving to block requires active entry to be 0
            this.state.update((state) => ({ ...state, activeIdx: 0 }));
          }
          break;
      }
    });
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

  private moveToPreviousEntry() {
    if (this.activeIdx() > 0) {
      this.state.update((state) => ({
        ...state,
        activeIdx: state.activeIdx - 1,
      }));
    } else {
      if (this.blockService.activatePrevious()) {
        console.log("previous block activated");
        this.state.update((state) => ({
          ...state,
          activeIdx: this.getLastEntryIdxOfBlock(),
        }));
      }
    }
  }

  private getLastEntryIdxOfBlock(): number {
    const entriesOfPreviousBlock = this.entries().get(
      this.blockService.blocks()[this.blockService.activeIdx()].id,
    );
    if (entriesOfPreviousBlock) {
      return entriesOfPreviousBlock.length - 1;
    }
    return 0;
  }

  private moveToNextEntry() {
    const amountOfEntriesForBlock = this.entries().get(
      this.blockService.active.id,
    )?.length;
    if (
      amountOfEntriesForBlock &&
      this.state().activeIdx < amountOfEntriesForBlock - 1
    ) {
      this.state.update((state) => ({
        ...state,
        activeIdx: state.activeIdx + 1,
      }));
    } else {
      if (this.blockService.activateNext()) {
        this.state.update((state) => ({
          ...state,
          activeIdx: 0,
        }));
      }
    }
  }

  private handleError(err: any) {
    this.state.update((state) => ({ ...state, error: err }));
    return EMPTY;
  }
}
